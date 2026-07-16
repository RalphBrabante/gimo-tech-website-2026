(function () {
  function initGallery(root) {
    var main = root.querySelector('.product-gallery-main');
    var slides = root.querySelectorAll('.product-gallery-slide');
    var thumbs = root.querySelectorAll('.product-thumb');
    if (!main || !slides.length || !thumbs.length) return;

    function setActive(index) {
      thumbs.forEach(function (thumb, i) {
        thumb.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        var target = slides[i];
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        setActive(i);
      });
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var index = Array.prototype.indexOf.call(slides, entry.target);
              if (index !== -1) setActive(index);
            }
          });
        },
        { root: main, threshold: 0.6 }
      );
      slides.forEach(function (slide) {
        observer.observe(slide);
      });
    }
  }

  function initZoom(container) {
    var img = container.querySelector('img');
    if (!img) return;
    container.addEventListener('mousemove', function (event) {
      var rect = container.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = x + '% ' + y + '%';
    });
    container.addEventListener('mouseleave', function () {
      img.style.transformOrigin = '';
    });
  }

  document.querySelectorAll('.product-gallery').forEach(initGallery);
  document.querySelectorAll('.product-page-media, .product-gallery-slide').forEach(initZoom);
})();
