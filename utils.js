var crypto = require('crypto');

exports.generate_authcode = function() {
  var ret = "";
  for (var i = 1; i <= 8; i++) {
    var x = Math.floor(Math.random() * 26);
    ret += String.fromCharCode(97 + x);
  }
  return ret;
}

exports.generate_filename = function(lang) {
    var filename = crypto.randomBytes(20).toString('hex');
    if (lang == "C") {
        filename += ".c";
    }
    else if(lang == "C++") {
        filename += ".cpp";
    }
    else if(lang == "Java") {
        filename += ".java";
    }
    return filename;
}
