var config = {};

config.port = 80;

config.gid = 1000;
config.uid = 1000;

config.session_secret = "canyouguessthisiguessyoucant";

// TODO: this should be different for each user
config.salt = "thismaywreckeverything";

module.exports = config;
