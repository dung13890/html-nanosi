(function($) {

  'use strict';

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
          animateOut: 'zoomOut',
          animateIn: 'zoomIn',
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
