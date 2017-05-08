(function($) {

  'use strict';

  function getRandomAnimation(position = 'in') {
    var animationList = (position == 'in') ? ['bounce', 'zoomIn', 'fadeIn', 'flipInX']
      : ['bounce', 'zoomOut', 'fadeOut', 'slideOutDown']; 
      return animationList[Math.floor(Math.random() * animationList.length)];
    }

  /* ------------- Document.ready ------------- */
  $(document).ready(function() {

    // Menu zord
    $("#menuzord").menuzord({
      indicatorFirstLevel: "<i class='fa fa-angle-down'></i>"
    });

    // Slideshow
    var owlSlideShow = $('.slide-show.owl-carousel');

    if ( owlSlideShow.length ) {
      owlSlideShow.each( function() {
        $(this).owlCarousel({
          items: 1,
          margin: 0,
          nav: true,
          loop: true,
          autoplay: true,
          autoplayTimeout: 3000,
          animateOut: 'slideOutDown',
          animateIn: 'flipInX',
          smartSpeed: 450,
          responsive: {
            0: {
              items: 1
            },
            600: {
              items: 1
            },
            1000: {
              items: 1
            }
          }
        });
      });
    }
  });

  /* ------------- Window.load ------------- */
  $(window).load(function() {

  });

})(jQuery);
