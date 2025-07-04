document.addEventListener('DOMContentLoaded', () => {
  const dropdown     = document.querySelector('.nav-links .dropdown');
  const toggleLink   = dropdown.querySelector('a.has-arrow');
  const panel        = dropdown.querySelector('.dropdown-menu.mega');
  const primaries    = document.querySelectorAll('.primary-menu li[data-key]');
  const subBlocks    = document.querySelectorAll('.sub-block');
  const videoEl      = document.getElementById('megaPreview');
  const sourceEl     = videoEl.querySelector('source');

  // — map each key to its video file —
  const videoMap = {
    all:      '/Assets/videos/all-services.mp4',
    tax:      '/Assets/videos/taxation.mp4',
    acct:     '/Assets/videos/accounting.mp4',
    audit:    '/Assets/videos/audit.mp4',
    adv:      '/Assets/videos/advisory.mp4',
    start:    '/Assets/videos/formation.mp4',
    personal: '/Assets/videos/personal.mp4',
    wealth:   '/Assets/videos/wealth.mp4',
    spec:     '/Assets/videos/specialist.mp4',
    industry: '/Assets/videos/industry.mp4'
  };

  // helpers
  function clearSubBlocks() {
    subBlocks.forEach(sb => sb.style.display = 'none');
  }
  function clearActive() {
    primaries.forEach(li => li.classList.remove('active'));
  }

  // 1) click “Financial Services” to toggle open/close
  toggleLink.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle('open');

    if (!dropdown.classList.contains('open')) {
      clearSubBlocks();
      clearActive();
      // reset video to “all” when menu closes
      sourceEl.src = videoMap.all;
      videoEl.load();
    }
  });

  // 2) clicks inside panel should NOT close it
  panel.addEventListener('click', e => e.stopPropagation());

  // 3) click elsewhere closes menu + clears state
  document.addEventListener('click', () => {
    if (dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      clearSubBlocks();
      clearActive();
      sourceEl.src = videoMap.all;
      videoEl.load();
    }
  });

  // 4) hover on a primary: show sub-block, mark active, swap video
  primaries.forEach(li => {
    li.addEventListener('mouseenter', () => {
      clearSubBlocks();
      clearActive();
      li.classList.add('active');

      const key = li.dataset.key;
      // show the matching sub-block
      const block = document.querySelector(`.sub-block[data-key="${key}"]`);
      if (block) block.style.display = 'block';

      // swap the video source
      const newSrc = videoMap[key] || videoMap.all;
      sourceEl.src = newSrc;
      videoEl.load();
      videoEl.play();
    });
  });

  // 5) when mouse leaves the panel entirely, clear state + reset video
  panel.addEventListener('mouseleave', () => {
    clearSubBlocks();
    clearActive();
    sourceEl.src = videoMap.all;
    videoEl.load();
  });

  // 6) mobile menu toggle remains unchanged
  window.toggleMenu = function() {
    document.getElementById('navLinks').classList.toggle('open');
  };
});

// Hero video background rotation with fade transitions
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('heroVideo');
  const source = document.getElementById('videoSource');

  if (video && source) {
    const videos = [
      'Assets/hero-background.mp4',
      'Assets/hero-background-2.mp4'
    ];

    let currentIndex = 0;

    function playNextVideo() {
      video.classList.remove('fade-in', 'fade-out');
      video.classList.add('fade-out');

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % videos.length;
        source.src = videos[currentIndex];
        video.load();

        video.oncanplay = () => {
          video.classList.remove('fade-out');
          video.classList.add('fade-in');
          video.play().catch(err => console.error('Playback error:', err));
        };
      }, 100);
    }

    video.addEventListener('ended', playNextVideo);
  }
});

// Calendly popup
function openCalendly() {
  Calendly.initPopupWidget({
    url: 'https://calendly.com/citiline/30min'
  });
  return false;
}

// AOS animation initialisation
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    once: false,
    offset: 120,
    duration: 800,
    easing: 'ease-out-cubic',
    mirror: false
  });
});


