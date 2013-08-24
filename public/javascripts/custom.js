$("input,textarea,select").jqBootstrapValidation(
{
  preventSubmit: true,
  submitError: function($form, event, errors) {
  },
  submitSuccess: function($form, event) {
  },
  filter: function() {
    return $(this).is(":visible");
  }
}); 

$(document).ready(function() {
    // Whether to display error text or not for logging in
    var url = window.location;
    var location = url.pathname;
    var query = url.search;
    if (location == '/login') {
        if (query.indexOf("invalid=1") != -1) {
            $("#error-msg")[0].style.display = "block";
        }
    }
});
