var config = {};

config.port = 80;

config.gid = 1000;
config.uid = 1000;

// Database name
config.db = 'judge';

// For session tracking
config.session_secret = "canyouguessthisiguessyoucant";

// TODO: this should be different for each user
config.salt = "thismaywreckeverything";

// For registration
config.passcode = "donotgivethistoastranger";

config.PRIVILEGE_ADMIN = 0;
config.PRIVILEGE_USER = 1;

config.AUTO_GRADING = "Automatic Grading";
config.MANUAL_GRADING = "Manual Grading";

// config.languages = ["C", "C++", "Java"];
config.languages = ["C", "C++"];

config.judge_statuses = {
    QUEUED : "Queued",
    RUNNING : "Running",
    COMPUTER_GRADED : "Computer Graded",
    TLE : "Time Limit Exceeded",
    CE : "Compile Error",
    RTE : "Run Time Error",
    MANUAL_GRADE_PENDING : "Manual Grade Pending",
    MANUALLY_GRADED : "Manually Graded"
};


module.exports = config;
