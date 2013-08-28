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
AUTO_GRADING = "Automatic Grading"
MANUAL_GRADING = "Manual Grading"
###


db = client['judge']

submissions = db.submissions
problems = db.problems
scores = db.scores
manualgrades = db.manualgrades
users = db.users

submissions.create_index([('submission_date', ASCENDING)])
scores.create_index([('score', DESCENDING)])

problem_list = [problem for problem in problems.find({})]
user_list = [user for user in users.find({})]

def get_score(username, problem):
  if (problem['grading_type'] == MANUAL_GRADING):
    query = {'problem_code': problem['code'], 'username': username}
    res = manualgrades.find_one(query)

    if (not res):
      return 0

    score = res['score']

    # Update all submissions for the problem
    for sub in submissions.find(query):
      submissions.update(sub, {"$set": {
        'judge_status': judge_statuses['MANUALLY_GRADED'],
        'judge_result_manual': score}})

    return score

  if (problem['grading_type'] == AUTO_GRADING):
    # Get all graded submissions for the problem
    subs = [sub for sub in submissions.find({
      'username': username,
      'problem_code': problem['code']}).sort('submission_date')]

    # We're interested in the latest submission which was judged
    while(len(subs) > 0 and (subs[-1]['judge_status']  in [judge_statuses['QUEUED'], judge_statuses['RUNNING']])):
      subs.pop()

    if (len(subs) == 0):
      return 0

    sub = subs[-1]
    if (sub['judge_status'] != judge_statuses['COMPUTER_GRADED']):
      return 0

    # Submission 'accepted', calculate score

    res = 0

    assert(problem['num_input_files'] == len(sub['judge_result_auto']) == len(problem['input_file_weights']))
    for i in xrange(problem['num_input_files']):
      #print problem['input_file_weights'][i], sub['judge_result_auto'][i]
      res += problem['input_file_weights'][i] * sub['judge_result_auto'][i]

    res /= 100.0
    res *= problem['points']

    return res

def update_score(username):
  score = 0
  #print username
  for problem in problem_list:
    sc = get_score(username, problem)
    score += sc

    #print problem['name'], sc

  s = scores.find_one({'username': username})
  if s:
    if s['score'] != score:
      print "%s: Old Score: %d, New Score: %d" % (username, s['score'], score)
    scores.update(s, {"$set": {'score': score}})
  else:
    print "%s: Score: %d" % (username, score)
    scores.insert({'username': username, 'score': score})

  #print 

for user in user_list:
  update_score(user['username'])
