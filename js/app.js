function main() { //eslint-disable-line no-unused-vars
  setLayout();
}

function setLayout() {

  const dimension = $.url('?size');


  if ($.url('?do-reset') === 'X') { //launch the app
    $('#save-dimension').val(dimension);
    if ($('#app').hasClass('hidden')) { //show app if hidden
      $('#app').toggleClass('hidden');
    }
    if (!$('#entry-form').hasClass('hidden')) { //hide entry-form if visible
      $('#entry-form').toggleClass('hidden');
    }
  } else { //show the initial screen
    if (!(dimension === undefined)) {$('#dimension').val(dimension);}
    if (!$('#app').hasClass('hidden')) { //hide app if visible
      $('#app').toggleClass('hidden');
    }
    if ($('#entry-form').hasClass('hidden')) { //show entry-form if hidden
      $('#entry-form').toggleClass('hidden');
    }
  }
}
