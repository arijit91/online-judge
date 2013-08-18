exports.generate_authcode = function() {
  var ret = "";
  for (var i = 1; i <= 8; i++) {
    var x = Math.floor(Math.random() * 26);
    ret += String.fromCharCode(97 + x);
  }
  return ret;
}
