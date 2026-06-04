/* ============================================================
   이율곡 Marketing Portfolio — v3 (Slide Deck Edition)
   - D3 v7 chart (inquiry trend vs peer average)
   - Counter animation with viewport-aware trigger
   - Horizontal slide deck navigation (desktop ≥ 1024px)
   - Vertical scroll fallback (mobile < 1024px)
   ============================================================ */

/* -------- Data -------- */
const months = [
  '24.03','24.04','24.05','24.06','24.07','24.08','24.09','24.10','24.11','24.12',
  '25.01','25.02','25.03','25.04','25.05','25.06','25.07','25.08','25.09','25.10',
  '25.11','25.12','26.01','26.02','26.03','26.04'
];

const inquiryData = [3,9,4,9,10,4,3,13,15,24,18,7,23,18,7,17,28,18,20,9,16,18,14,10,10,5];
const peerData    = [4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3];
const viewsData   = [null,467,988,637,880,719,988,1767,2261,1764,1386,1223,1034,1067,845,1117,1110,1093,813,627,695,694,329,397,505,607];

const comparisonData = [
  { name: '개인문의 월평균', unit: '건',   y1: 9.3,   y2: 16,    growth: '+72%' },
  { name: '매출',          unit: '억원', y1: 1.37,  y2: 2.17,  growth: '+58%' },
  { name: '등록단가',      unit: '만원', y1: 53.2,  y2: 92.8,  growth: '+74%' },
  { name: '상담률',        unit: '%',   y1: 29,    y2: 38,    growth: '+9%p' }
];

const YEAR_DIVIDER_LEFT_IDX  = 11;
const YEAR_DIVIDER_RIGHT_IDX = 12;

/* -------- Tooltip -------- */
let tooltipEl;
function getTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}
function showTooltip(html, event) {
  const t = getTooltip();
  t.innerHTML = html;
  t.classList.add('is-visible');
  moveTooltip(event);
}
function moveTooltip(event) {
  const t = getTooltip();
  const x = event.clientX, y = event.clientY;
  const rect = t.getBoundingClientRect();
  const off = 14;
  let left = x + off;
  if (left + rect.width > window.innerWidth - 8) left = x - rect.width - off;
  let top = y + off;
  if (top + rect.height > window.innerHeight - 8) top = y - rect.height - off;
  t.style.left = (left + window.scrollX) + 'px';
  t.style.top  = (top  + window.scrollY) + 'px';
}
function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove('is-visible');
}

/* -------- Counter animation -------- */
function animateCounter(el) {
  if (el.dataset.done === '1') return;
  el.dataset.done = '1';

  const target   = parseFloat(el.dataset.counter);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    let formatted;
    if (decimals > 0)        formatted = value.toFixed(decimals);
    else if (target >= 1000) formatted = Math.round(value).toLocaleString('en-US');
    else                     formatted = Math.round(value).toString();
    el.textContent = prefix + formatted + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * isInViewport — checks BOTH horizontal AND vertical intersection.
 * Critical for the horizontal slide deck: elements in off-screen slides
 * (translated away via CSS transform) must NOT fire at init.
 */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top    < window.innerHeight && rect.bottom > 0 &&
    rect.left   < window.innerWidth  && rect.right  > 0
  );
}

function initCounters() {
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach((el) => {
    if (isInViewport(el)) animateCounter(el);
    else io.observe(el);
  });

  setTimeout(() => {
    counters.forEach((el) => {
      if (el.dataset.done !== '1' && isInViewport(el)) animateCounter(el);
    });
  }, 500);
}

/* -------- Nav active state (scroll-spy for mobile) -------- */
function setupNavObserver() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__menu a[data-nav]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.dataset.nav === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach((s) => io.observe(s));
}

/* -------- Funnel reveal (mobile scroll mode) -------- */
function setupFunnelReveal() {
  const funnel = document.querySelector('.funnel');
  if (!funnel) return;
  if (isInViewport(funnel)) { funnel.classList.add('is-visible'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { funnel.classList.add('is-visible'); io.disconnect(); }
    });
  }, { threshold: 0.3 });
  io.observe(funnel);
}

/* ============================================================
   Chart — 개인문의 추이 vs 전국 사업부 평균
   ============================================================ */
function renderInquiryChart() {
  const container = document.getElementById('chart-inquiry');
  if (!container) return;
  container.innerHTML = '';

  const width  = container.clientWidth || 800;
  const height = Math.max(container.clientHeight || 380, 260);
  const margin = { top: 28, right: 28, bottom: 44, left: 48 };
  const innerW = width  - margin.left - margin.right;
  const innerH = height - margin.top  - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', '100%');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint().domain(months).range([0, innerW]).padding(0);
  const y = d3.scaleLinear().domain([0, 32]).range([innerH, 0]).nice();

  /* Grid */
  g.append('g').attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(''));

  /* Axes */
  const xTicks = months.filter((_, i) => i % 3 === 0);
  g.append('g').attr('class', 'axis').attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(xTicks).tickSize(4));
  g.append('g').attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => d + '건'));

  /* Year divider */
  const divX = (x(months[YEAR_DIVIDER_LEFT_IDX]) + x(months[YEAR_DIVIDER_RIGHT_IDX])) / 2;
  g.append('line').attr('class', 'year-divider')
    .attr('x1', divX).attr('x2', divX).attr('y1', 0).attr('y2', innerH);
  g.append('text').attr('class', 'year-label').attr('x', divX - 6).attr('y', 14)
    .attr('text-anchor', 'end').text('1년차');
  g.append('text').attr('class', 'year-label').attr('x', divX + 6).attr('y', 14)
    .attr('text-anchor', 'start').text('2년차');

  /* Peer line */
  const peerPath = g.append('path').datum(peerData).attr('class', 'line-peer')
    .attr('d', d3.line().x((d, i) => x(months[i])).y(d => y(d)));

  /* Inquiry line */
  const lineInq = d3.line().x((d, i) => x(months[i])).y(d => y(d)).curve(d3.curveMonotoneX);
  const inqPath = g.append('path').datum(inquiryData).attr('class', 'line-inquiry').attr('d', lineInq);

  /* Dots */
  const dots = g.selectAll('.dot-inquiry').data(inquiryData).enter()
    .append('circle').attr('class', 'dot-inquiry')
    .attr('cx', (d, i) => x(months[i])).attr('cy', d => y(d)).attr('r', 0);

  /* Peak labels */
  const peaks = [{ label: '24.12', value: 24 }, { label: '25.07', value: 28 }]
    .map(p => ({ ...p, idx: months.indexOf(p.label) }));
  const peakG = g.append('g').attr('class', 'peaks').attr('opacity', 0);
  peaks.forEach(p => {
    peakG.append('text').attr('class', 'peak-label')
      .attr('x', x(months[p.idx])).attr('y', y(p.value) - 12)
      .attr('text-anchor', 'middle').text(`${p.value}건`);
  });

  /* Animate */
  const totalLen = inqPath.node().getTotalLength();
  inqPath.attr('stroke-dasharray', `${totalLen} ${totalLen}`)
    .attr('stroke-dashoffset', totalLen)
    .transition().duration(1600).ease(d3.easeCubicOut)
    .attr('stroke-dashoffset', 0)
    .on('end', () => peakG.transition().duration(400).attr('opacity', 1));

  peerPath.attr('stroke-dasharray', '4 4').attr('opacity', 0)
    .transition().duration(800).delay(800).attr('opacity', 1);

  dots.transition().duration(300).delay((d, i) => 600 + i * 30).attr('r', 4);

  /* Hover */
  dots.on('mouseenter', function (event, d) {
    const i = inquiryData.indexOf(d);
    d3.select(this).attr('r', 6);
    const peer = peerData[i];
    const diff = peer > 0 ? Math.round(((d - peer) / peer) * 100) : 0;
    showTooltip(`
      <div class="tooltip__title">${months[i]}</div>
      <div class="tooltip__row"><span>본인 문의</span><span>${d}건</span></div>
      <div class="tooltip__row"><span>전국 사업부 평균</span><span>${peer}건</span></div>
      <div class="tooltip__row tooltip__row--accent"><span>상회율</span><span>${diff >= 0 ? '+' : ''}${diff}%</span></div>
    `, event);
  })
  .on('mousemove', moveTooltip)
  .on('mouseleave', function () { d3.select(this).attr('r', 4); hideTooltip(); });

  /* Legend */
  const legend = g.append('g').attr('transform', `translate(${innerW - 220}, 0)`);
  legend.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 6).attr('y2', 6)
    .attr('stroke', 'var(--accent)').attr('stroke-width', 2);
  legend.append('text').attr('x', 24).attr('y', 10).attr('class', 'legend-text').text('개인문의');
  legend.append('line').attr('x1', 100).attr('x2', 118).attr('y1', 6).attr('y2', 6)
    .attr('stroke', 'var(--text-faint)').attr('stroke-width', 1.5).attr('stroke-dasharray', '4 4');
  legend.append('text').attr('x', 124).attr('y', 10).attr('class', 'legend-text').text('전국 사업부 평균');
}

/* -------- Chart observers (mobile scroll mode) -------- */
const renderedCharts = new Set();

function setupChartObservers() {
  const el = document.getElementById('chart-inquiry');
  if (!el) return;

  if (isInViewport(el)) { renderInquiryChart(); renderedCharts.add('chart-inquiry'); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        renderInquiryChart();
        renderedCharts.add('chart-inquiry');
        io.disconnect();
      }
    });
  }, { threshold: 0.15 });

  io.observe(el);

  setTimeout(() => {
    if (!renderedCharts.has('chart-inquiry') && isInViewport(el)) {
      renderInquiryChart();
      renderedCharts.add('chart-inquiry');
    }
  }, 600);
}

/* -------- Resize handler -------- */
let resizeTimer;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (renderedCharts.has('chart-inquiry')) renderInquiryChart();
  }, 250);
}

/* ============================================================
   Initialise scroll-based systems
   ============================================================ */
function init() {
  initCounters();
  setupNavObserver();
  setupFunnelReveal();
  setupChartObservers();
  window.addEventListener('resize', handleResize);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ============================================================
   DECK MANAGER — Horizontal Slide Navigation
   Desktop (≥ 1024px): keyboard / wheel / arrow-button / dot
   Mobile  (< 1024px): no-op — CSS switches to vertical scroll
   ============================================================ */
(function () {
  'use strict';

  var BREAKPOINT = 1024;
  var TOTAL      = 10;
  var cur        = 0;
  var animating  = false;
  var wheelAcc   = 0;
  var wheelTimer;

  /* Slide index → nav data-nav key (for active state update) */
  var slideNavMap = {
    0: null,
    1: 'snapshot',
    2: 'loop',
    3: 'loop',    /* funnel is part of loop section */
    4: 'cases',
    5: 'cases',
    6: 'cases',
    7: 'performance',
    8: 'about',
    9: 'contact'
  };

  var deck     = document.getElementById('deck');
  var dotsWrap = document.getElementById('deck-dots');
  var prevBtn  = document.getElementById('deck-prev');
  var nextBtn  = document.getElementById('deck-next');

  function isDesktop() { return window.innerWidth >= BREAKPOINT; }

  /* Core navigation function */
  function goTo(n) {
    if (!isDesktop() || animating) return;
    n = Math.max(0, Math.min(TOTAL - 1, n));
    if (n === cur) return;
    animating = true;
    cur = n;
    deck.style.transform = 'translateX(calc(' + (-n) + ' * 100vw))';
    updateDots();
    updateArrows();
    updateNavActive(slideNavMap[n]);
    setTimeout(function () { animating = false; }, 700);
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.deck-dot').forEach(function (d, i) {
      d.classList.toggle('is-active', i === cur);
      d.setAttribute('aria-selected', i === cur ? 'true' : 'false');
    });
  }

  function updateArrows() {
    prevBtn.disabled = (cur === 0);
    nextBtn.disabled = (cur === TOTAL - 1);
  }

  function updateNavActive(navKey) {
    document.querySelectorAll('.nav__menu a[data-nav]').forEach(function (link) {
      link.classList.toggle('is-active', !!navKey && link.dataset.nav === navKey);
    });
  }

  /* Build 10 indicator dots */
  function buildDots() {
    for (var i = 0; i < TOTAL; i++) {
      var btn = document.createElement('button');
      btn.className = 'deck-dot' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', '슬라이드 ' + (i + 1));
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      (function (idx) {
        btn.addEventListener('click', function () { goTo(idx); });
      }(i));
      dotsWrap.appendChild(btn);
    }
  }

  /* Reset when switching from desktop → mobile */
  function resetForMobile() {
    deck.style.transform = '';
    cur = 0;
    updateDots();
    updateArrows();
    updateNavActive(null);
  }

  function init() {
    if (!deck || !dotsWrap || !prevBtn || !nextBtn) return;

    buildDots();

    /* Arrow buttons */
    prevBtn.addEventListener('click', function () { goTo(cur - 1); });
    nextBtn.addEventListener('click', function () { goTo(cur + 1); });

    /* Keyboard: ← → ↑ ↓ */
    document.addEventListener('keydown', function (e) {
      if (!isDesktop()) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); goTo(cur + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); goTo(cur - 1);
      }
    });

    /* Mouse wheel + trackpad horizontal swipe */
    var wheelLocked = false;   /* 한 번 넘긴 뒤 스크롤이 멈출 때까지 잠금 */
    document.addEventListener('wheel', function (e) {
      if (!isDesktop()) return;
      e.preventDefault();
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      /* 스크롤이 이어지는 동안 타이머 연장: 120ms 정적이어야 잠금 해제 */
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () {
        wheelAcc = 0;
        wheelLocked = false;
      }, 120);

      if (wheelLocked) return;   /* 잠금 중엔 누적도 넘김도 안 함 */

      wheelAcc += delta;
      if (wheelAcc > 90)  { wheelAcc = 0; wheelLocked = true; goTo(cur + 1); }
      else if (wheelAcc < -90) { wheelAcc = 0; wheelLocked = true; goTo(cur - 1); }
    }, { passive: false });

    /* Nav links → slide in desktop mode */
    document.querySelectorAll('.nav__menu a[data-nav]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!isDesktop()) return;
        e.preventDefault();
        var targetEl = document.getElementById(link.getAttribute('data-nav'));
        if (targetEl && targetEl.dataset.slide !== undefined) {
          goTo(parseInt(targetEl.dataset.slide, 10));
        }
      });
    });

    /* Logo → slide 0 */
    var brand = document.querySelector('.nav__brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        if (!isDesktop()) return;
        e.preventDefault();
        goTo(0);
      });
    }

    /* Touch swipe (for desktop touch screens) */
    var touchX = 0;
    document.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!isDesktop()) return;
      var dx = touchX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) goTo(dx > 0 ? cur + 1 : cur - 1);
    }, { passive: true });

    /* Resize: switch desktop ↔ mobile */
    var wasDesktop = isDesktop();
    window.addEventListener('resize', function () {
      var nowDesktop = isDesktop();
      if (!nowDesktop && wasDesktop) resetForMobile();
      wasDesktop = nowDesktop;
    });

    updateArrows();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
