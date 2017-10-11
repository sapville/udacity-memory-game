function main() { //eslint-disable-line no-unused-vars
  setLayout();
}

function setLayout() {

  if (Boolean(true)) {
    if (!$('#app').hasClass('hidden')) { //hide app if visible
      $('#app').toggleClass('hidden');
    }
    if ($('#entry-form').hasClass('hidden')) { //show entry-form if hidden
      $('#entry-form').toggleClass('hidden');
    }
    $('#pass-size').val($('#size').val());
  } else {
    if ($('#app').hasClass('hidden')) { //show app if hidden
      $('#app').toggleClass('hidden');
    }
    if (!$('#entry-form').hasClass('hidden')) { //hide entry-form if visible
      $('#entry-form').toggleClass('hidden');
    }
  }
}
