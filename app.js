// js/app.js
(function () {
  'use strict';

  const gallery = document.getElementById('gallery');
  const cards = Array.from(gallery.querySelectorAll('.card'));
  const filters = Array.from(document.querySelectorAll('.filter'));
  const search = document.getElementById('search');
  const msg = document.getElementById('msg');

  const lb = document.getElementById('lightbox');
  const lbBackdrop = lb.querySelector('.backdrop');
  const lbImg = lb.querySelector('.lb-image');
  const lbCaption = lb.querySelector('.lb-caption');
  const lbClose = lb.querySelector('.lb-close');
  const lbNext = lb.querySelector('.lb-next');
  const lbPrev = lb.querySelector('.lb-prev');

  let currentFilter = 'all';
  let currentSearch = '';
  let visibleCards = cards.slice();
  let currentIndex = -1;

  function computeVisible() {
    visibleCards = cards.filter(c => !c.classList.contains('hidden'));
  }

  function applyFilters() {
    const s = currentSearch.trim().toLowerCase();
    let anyVisible = false;
    cards.forEach(card => {
      const cat = (card.dataset.category || '').toLowerCase();
      const title = (card.dataset.title || '').toLowerCase();
      const matchCat = (currentFilter === 'all') || (cat === currentFilter);
      const matchSearch = (!s) || title.includes(s);
      const show = matchCat && matchSearch;
      if (show) {
        card.classList.remove('hidden');
        anyVisible = true;
      } else {
        card.classList.add('hidden');
      }
    });
    computeVisible();
    msg.textContent = anyVisible ? '' : 'No images found — try another filter or search term.';
    msg.setAttribute('aria-hidden', anyVisible ? 'true' : 'false');
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = (btn.dataset.filter || 'all').toLowerCase();
      applyFilters();
    });
  });

  let t;
  search.addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      currentSearch = e.target.value || '';
      applyFilters();
    }, 120);
  });

  function openLightbox(idx) {
    if (visibleCards.length === 0) return;
    currentIndex = ((idx % visibleCards.length) + visibleCards.length) % visibleCards.length;
    const card = visibleCards[currentIndex];
    const img = card.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt || card.dataset.title || '';
    lbCaption.textContent = (card.dataset.title || '') + ' — ' + (card.dataset.category || '');
    lb.classList.add('show');
    lb.setAttribute('aria-hidden', 'false');
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('show');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    currentIndex = -1;
  }

  function showNext() {
    if (visibleCards.length === 0) return;
    openLightbox(currentIndex + 1);
  }
  function showPrev() {
    if (visibleCards.length === 0) return;
    openLightbox(currentIndex - 1);
  }

  gallery.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('hidden')) return;
    computeVisible();
    const idx = visibleCards.indexOf(card);
    openLightbox(idx);
  });

  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', showNext);
  lbPrev.addEventListener('click', showPrev);
  lbBackdrop.addEventListener('click', (ev) => { if (ev.target.dataset.close === 'true') closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('show')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });

  cards.forEach(c => {
    c.tabIndex = 0;
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        computeVisible();
        openLightbox(visibleCards.indexOf(c));
      }
    });
  });

  // Initial
  applyFilters();
  console.info('Gallery (js/app.js) initialized');
})();