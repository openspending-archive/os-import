var $ = require('jquery');

function adjustWidth() {
  $('.promo__arrow-wrapper').width($('.promo__main').width());
}

$('[data-delay]').each(function() {
  setTimeout(
    (function() { $(this).addClass('is-animated'); }).bind(this),
    $(this).attr('data-delay')
  );
});

adjustWidth();
$(window).on('resize', adjustWidth);
