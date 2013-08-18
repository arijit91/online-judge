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
