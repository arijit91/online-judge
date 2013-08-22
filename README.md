Online Judge for programming contests.

Todo:
Check for duplicate users asynchronously

Possible security holes to be noted:
Not using password protection for MongoDB, so make sure it is accessible only from localhost. (More at routes.js)
Validate POST data for registration similar to how it was done on the front end.
