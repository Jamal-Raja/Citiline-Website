// ==============================
// Navbar initialization logic
// ==============================
function initializeNavbar() {
  const dropdown   = document.querySelector('.nav-links .dropdown');
  if (!dropdown) return;
  const toggleLink = dropdown.querySelector('a.has-arrow');
  const panel      = dropdown.querySelector('.dropdown-menu.mega');
  const primaries  = document.querySelectorAll('.primary-menu li[data-key]');
  const subBlocks  = document.querySelectorAll('.sub-block');
  const videoEl    = document.getElementById('megaPreview');
  const sourceEl   = videoEl.querySelector('source');

  // map each key to its video file
  const videoMap = {
    all:      'Assets/videos/all-services.mp4',
    tax:      'Assets/videos/taxation.mp4',
    acct:     'Assets/videos/accounting.mp4',
    audit:    'Assets/videos/audit.mp4',
    adv:      'Assets/videos/advisory.mp4',
    start:    'Assets/videos/formation.mp4',
    personal: 'Assets/videos/personal.mp4',
    wealth:   'Assets/videos/wealth.mp4',
    spec:     'Assets/videos/specialist.mp4',
    industry: 'Assets/videos/industry.mp4'
  };

  // helpers
  function clearSubBlocks() {
    subBlocks.forEach(sb => sb.style.display = 'none');
  }
  function clearActive() {
    primaries.forEach(li => li.classList.remove('active'));
  }

  // 1) click “Our Services” to toggle open/close
  toggleLink.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle('open');
    if (!dropdown.classList.contains('open')) {
      clearSubBlocks();
      clearActive();
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
      const block = document.querySelector(`.sub-block[data-key="${key}"]`);
      if (block) block.style.display = 'block';

      const newSrc = videoMap[key] || videoMap.all;
      sourceEl.src = newSrc;
      videoEl.load();
      videoEl.play().catch(() => {});
    });
  });

  // 5) when mouse leaves the panel entirely, clear state + reset video
  panel.addEventListener('mouseleave', () => {
    clearSubBlocks();
    clearActive();
    sourceEl.src = videoMap.all;
    videoEl.load();
  });
}

// If navbar already present in DOM, initialize immediately
if (document.querySelector('.navbar')) {
  initializeNavbar();
}

// ==============================
// Navbar injector (external navbar.html)
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
  const placeholder = document.getElementById('site-navbar');
  if (!placeholder) return;
  try {
    const resp = await fetch('navbar.html');
    if (!resp.ok) throw new Error(`Navbar load error: ${resp.status}`);
    const html = await resp.text();
    placeholder.innerHTML = html;
    initializeNavbar();
  } catch (err) {
    console.error(err);
  }
});

// =======================================
// Homepage Hero video background rotation
// =======================================
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('heroVideo');
  const source = document.getElementById('videoSource');
  if (!video || !source) return;
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
    }, 200);
  }
  video.addEventListener('ended', playNextVideo);
});

// ==============================
// Calendly popup
// ==============================
function openCalendly() {
  Calendly.initPopupWidget({ url: 'https://calendly.com/citiline/30min' });
  return false;
}

// ==============================
// AOS animation initialisation
// ============================== 
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    once: false,
    offset: 120,
    duration: 800,
    easing: 'ease-out-cubic',
    mirror: false
  });
});

// ===========================================
// Intersection Observer for scroll animations
// This adds slide-in-right animation
// to elements with class "animate-on-scroll"
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('slide-in-right');
      }
      else {
        el.classList.remove('slide-in-right');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.animate-on-scroll')
          .forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  const phoneIcon = document.querySelector('.tax-phone-icon');

  function triggerRing() {
    // force reflow so re-adding the class will replay the animation
    phoneIcon.classList.remove('ring');
    void phoneIcon.offsetWidth;
    phoneIcon.classList.add('ring');
  }

  // When one ring finishes, wait then ring again
  phoneIcon.addEventListener('animationend', () => {
    setTimeout(triggerRing, 4000);  // 4s delay between rings
  });

  // Kick off the first ring
  triggerRing();
});

// ==============================
// Related news cards from HMRC Atom feed
// ==============================

// This fetches the latest news from HMRC's Atom feed and displays it in a grid
// It uses the RSS2JSON API to convert the Atom feed to JSON format for easier handling
// The grid will show up to 3 articles with title, description, and link
// If the feed is unavailable or empty, it will show a placeholder message
// The images are placeholders; you can replace them with actual images if available
// The script runs once the DOM is fully loaded to ensure the container is available
document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector('.tax-news-grid');
  const feedUrl = encodeURIComponent("https://www.gov.uk/government/organisations/hm-revenue-customs.atom");
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`;

  const cacheKey = "hmrcNewsCache";
  const cacheTimeKey = "hmrcNewsCacheExpiry";
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; 

  const cached = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTimeKey);

  if (cached && cachedTime && now - cachedTime < oneHour) { 
    renderNews(JSON.parse(cached));
  } else {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === "ok" && data.items) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(cacheTimeKey, now);
          renderNews(data);
        } else {
          container.innerHTML = "<p>No news available at the moment.</p>";
        }
      })
      .catch(error => {
        console.error("Error fetching feed:", error);
        container.innerHTML = "<p>Unable to load news right now.</p>";
      });
  }

  function renderNews(data) {
    const articles = data.items.slice(0, 3);
    container.innerHTML = "";

    articles.forEach(item => {
      const article = document.createElement("article");
      article.className = "tax-news-item";

      let imageUrl = "Assets/news-feed-images/news-default.png";
      const title = item.title.toLowerCase();

      if (title.includes("vat")) imageUrl = "Assets/news-feed-images/vat.png";
      else if (title.includes("corporation tax") || title.includes("company tax")) imageUrl = "Assets/news-feed-images/corporation-tax.png";
      else if (title.includes("self assessment") || title.includes("self-assessment")) imageUrl = "Assets/news-feed-images/self-assessment.png";
      else if (title.includes("money laundering") || title.includes("criminal finance")) imageUrl = "Assets/news-feed-images/money-laundering.png";
      else if (title.includes("hmrc contact") || title.includes("scam") || title.includes("phishing") || title.includes("fraud")) imageUrl = "Assets/news-feed-images/security.png";
      else if (title.includes("pay tables") || title.includes("payroll") || title.includes("wages")) imageUrl = "Assets/news-feed-images/payroll.jpg";
      else if (title.includes("compliance") || title.includes("guidelines") || title.includes("standards")) imageUrl = "Assets/news-feed-images/compliance.jpg";
      else if (title.includes("tax return") || title.includes("submit return") || title.includes("file return")) imageUrl = "Assets/news-feed-images/tax-return.jpg";
      else if (title.includes("penalty") || title.includes("penalties") || title.includes("fine") || title.includes("interest charge") || title.includes("late filing")) imageUrl = "Assets/news-feed-images/penalty.jpg";
      else if (title.includes("budget") || title.includes("statement") || title.includes("obr") || title.includes("spring statement")) imageUrl = "Assets/news-feed-images/budget.jpg";
      else if (title.includes("registration") || title.includes("registered") || title.includes("register")) imageUrl = "Assets/news-feed-images/registration.jpg";
      else if (title.includes("r&d") || title.includes("research and development")) imageUrl = "Assets/news-feed-images/rd-tax.jpg";
      else if (title.includes("making tax digital") || title.includes("mtd")) imageUrl = "Assets/news-feed-images/mtd.jpg";
      else if (title.includes("covid") || title.includes("coronavirus")) imageUrl = "Assets/news-feed-images/covid-support.jpg";
      else if (title.includes("expenses") || title.includes("deductions") || title.includes("allowable expenses")) imageUrl = "Assets/news-feed-images/expenses.jpg";
      else if (title.includes("capital gains") || title.includes("cgt")) imageUrl = "Assets/news-feed-images/capital-gains.jpg";
      else if (title.includes("inheritance tax") || title.includes("iht")) imageUrl = "Assets/news-feed-images/inheritance-tax.jpg";
      else if (title.includes("dividends") || title.includes("dividend tax")) imageUrl = "Assets/news-feed-images/dividends.jpg";
      else if (title.includes("employment") || title.includes("paye")) imageUrl = "Assets/news-feed-images/employment.jpg";
      else if (title.includes("national insurance") || title.includes("ni contributions")) imageUrl = "Assets/news-feed-images/national-insurance.jpg";
      else if (title.includes("cash flow") || title.includes("forecast")) imageUrl = "Assets/news-feed-images/cash-flow.jpg";
      else if (title.includes("investment") || title.includes("investor") || title.includes("eis")) imageUrl = "Assets/news-feed-images/investment.jpg";

      article.innerHTML = `
        <div class="tax-news-image">
          <img src="${imageUrl}" loading="lazy" alt="${item.title}" />
        </div>
        <div class="tax-news-content">
          <time datetime="${item.pubDate}">${new Date(item.pubDate).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}</time>
          <h4>${item.title}</h4>
          <p>${item.description.substring(0, 140)}...</p>
          <a href="${item.link}" target="_blank" rel="noopener" class="tax-read-more">Read more</a>
        </div>
      `;

      container.appendChild(article);
    });
  }
});

function openSubmenu() {
  document.getElementById('servicesSubmenu').classList.add('open');
  document.getElementById('mainMobileMenu').style.display = 'none';
}

function closeSubmenu() {
  document.getElementById('servicesSubmenu').classList.remove('open');
  document.getElementById('mainMobileMenu').style.display = 'flex';
}

function toggleMobileMenu() {
  const nav = document.getElementById('mobileNav');
  const toggleBtn = document.getElementById('menuToggleBtn');

  nav.classList.toggle('open');

  // Lock or unlock scroll
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';

  // Show or hide hamburger button
  toggleBtn.style.display = nav.classList.contains('open') ? 'none' : 'flex';
}


// Callback form modal logic
function openCallbackForm() {
    document.getElementById('callbackModal').style.display = 'flex';
  }

function closeCallbackForm() {
    document.getElementById('callbackModal').style.display = 'none';
  }

document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("callbackDate");

  // Set min date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;

  // Block weekends
  dateInput.addEventListener('input', function () {
    const selectedDate = new Date(this.value);
    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      alert("Please select a weekday (Mon–Fri) for your callback.");
      this.value = '';
    }
  });

  const form = document.getElementById('callbackForm');
  if (!form) {
    console.error('Form not found!');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      date: formData.get('callbackDate'),
      time: formData.get('callbackTime'),
      message: formData.get('message') || '' // Default to empty string if not provided
    };

    try {
      const response = await fetch('https://citiline-website.onrender.com/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        this.reset();
        closeCallbackForm();
      } else {
        alert(`Error: ${result.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server. Check console for details.');
    }
  });
});