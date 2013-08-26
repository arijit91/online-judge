import os, commands
from pymongo import MongoClient, ASCENDING, DESCENDING
client = MongoClient('mongodb://localhost:27017')


### Hardcoded stuff. Should match config.js
judge_statuses = {
    "QUEUED" : "Queued",
    "RUNNING" : "Running",
    "COMPUTER_GRADED" : "Computer Graded",
    "TLE" : "Time Limit Exceeded",
    "CE" : "Compile Error",
    "RTE" : "Run Time Error",
    "MANUAL_GRADE_PENDING" : "Manual Grade Pending",
    "MANUALLY_GRADED" : "Manually Graded"
};
###


db = client['judge']
submissions = db.submissions
problems = db.problems
submissions.create_index([('submission_date', ASCENDING)])

basedir = os.getcwd()

def print_stats(sub):
  print "Looking at submission"
  print sub

def judge_submission(sub):
  print_stats(sub)

  # Move file to Jail
  src = basedir + '/uploads/submissions/' + sub['filename']
  dest = basedir + '/uploads/submissions/jail/' + sub['filename']
  cmd = "cp %s %s" % (src, dest)
  assert commands.getoutput(cmd) == ""

  # Move to jail
  os.chdir(basedir + '/uploads/submissions/jail/')

  # Compile

  if sub['language'] == 'C':
    compiler = 'gcc -O2 -lm'
  else:
    compiler = 'g++ -O2 -lm'

  compile_command = "%s %s" % (compiler, sub['filename'])

  compile_output = commands.getoutput(compile_command)

  if (compile_output != "") :
    print "Compile error"
    print 
    submissions.update(sub, {"$set": {'judge_status': judge_statuses['CE'], 'compile_error': compile_output}})
  else :
    print "Compiled successfully"
    submissions.update(sub, {"$set": {'compile_error': ""}})

    code = sub['problem_code']
    problem = problems.find({'code': code})[0]
    num_files = problem['num_input_files']
    time_limit = problem['time_limit']

    sandbox = './sandbox -t %s' % time_limit
    exe = 'a.out'

    for i in xrange(1, num_files + 1):
      print "Running submission on input file " + str(i) + '...'
      input_file = '../../problems/' + code + '/input/' + str(i) + '.in'
      cmd = '%s %s < %s > ' % (sandbox, exe, input_file) + str(i) + '.out' 
      output = commands.getoutput(cmd).split('return=')[1]

      if (output == 'tle'):
        print "Time Limit Exceeded"
        submissions.update(sub, {"$set": {'judge_status': judge_statuses['TLE']}})
        break

      elif (output != 'ok'):
        print "Run Time Error"
        submissions.update(sub, {"$set": {'judge_status': judge_statuses['RTE']}})
        break

    
    # All programs have completed running within time. But how have they done?
    print "Grading complete, here is how it did:"
    results = []
    for i in xrange(1, num_files + 1):
      correct = '../../problems/' + code + '/output/' + str(i) + '.out'
      given = str(i) + '.out'
      diffCmd = "diff --ignore-all-space --ignore-blank-lines %s %s" % (correct, given)
      diffOutput = commands.getoutput(diffCmd)

      if diffOutput == '':
        print "File " + str(i) + ': Correct'
        results.append(1)
      else:
        print "File " + str(i) + ': Wrong'
        results.append(0)

    submissions.update(sub, {"$set": {'judge_status': judge_statuses['COMPUTER_GRADED'],
      'judge_result_auto': results}})

    print


while 1:
  subs = submissions.find({'judge_status': judge_statuses['QUEUED']}).sort('submission_date')
  for sub in subs:
    judge_submission(sub)
