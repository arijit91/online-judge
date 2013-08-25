Online Judge for programming contests.

How to Setup:
Clone repo, install required node modules.
Create database in MongoDB with name specified in config.js
Change privilege level of user in DB to get admin users.
Make sure only localhost can bind to MongoDB.
Add problems and start judge!

Vulnerabilities / stuff to be fixed (in a universe where time is present in abundance):
Not using password protection for MongoDB, so make sure it is accessible only from localhost. (More at routes.js)
Validate POST data for registration similar to how it was done on the front end.

Reusing: 
To be used when you want to restart the contest.
Take a database dump.
Delete all the collections.
Register admin user and give him admin privilieges.
Add problems and start judge.

Rejudging:
This needs to be looked at.
Ideally, don't change stuff once the contest starts!
