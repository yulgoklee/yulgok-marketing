/* ============================================================
   이율곡 Marketing Portfolio — v2
   - 26-month dataset (2024.03 ~ 2026.04)
   - D3 v7 charts (inquiry / comparison / blog)
   - Counter animation with viewport-immediate trigger
   - Navigation active state
   - Scroll-triggered chart rendering (viewport-immediate)
   - Responsive re-render with debounce
   ============================================================ */

/* -------- Data (do not modify) -------- */
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

/* Year divider sits between index 11 (25.02) and 12 (25.03), matching the
   peer-average transition from 4 → 3. */
const YEAR_DIVIDER_LEFT_IDX = 11;
const YEAR_DIVIDER_RIGHT_IDX = 12;

/* -------- Tooltip helper -------- */
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
  const x = event.clientX;
  const y = event.clientY;
  const rect = t.getBoundingClientRect();
  const offset = 14;

  let left = x + offset;
  if (left + rect.width > window.innerWidth - 8) left = x - rect.width - offset;
  let top = y + offset;
  if (top + rect.height > window.innerHeight - 8) top = y - rect.height - offset;

  t.style.left = (left + window.scrollX) + 'px';
  t.style.top = (top + window.scrollY) + 'px';
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove('is-visible');
}

/* -------- Counter animation -------- */
function animateCounter(el) {
  if (el.dataset.done === '1') return;
  el.dataset.done = '1';

  const target = parseFloat(el.dataset.counter);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const value = target * eased;
    let formatted;
    if (decimals > 0) {
      formatted = value.toFixed(decimals);
    } else if (target >= 1000) {
      formatted = Math.round(value).toLocaleString('en-US');
    } else {
      formatted = Math.round(value).toString();
    }
    el.textContent = prefix + formatted + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function initCounters() {
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  if (counters.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

  counters.forEach((el) => {
    if (isInViewport(el)) {
      animateCounter(el);
    } else {
      io.observe(el);
    }
  });

  // Safety net — re-check any counters that somehow stayed at 0 after a beat.
  setTimeout(() => {
    counters.forEach((el) => {
      if (el.dataset.done !== '1' && isInViewport(el)) animateCounter(el);
    });
  }, 500);
}

/* -------- Navigation active state -------- */
function setupNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__menu a[data-nav]');

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

/* -------- Funnel reveal -------- */
function setupFunnelReveal() {
  const funnel = document.querySelector('.funnel');
  if (!funnel) return;
  if (isInViewport(funnel)) {
    funnel.classList.add('is-visible');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        funnel.classList.add('is-visible');
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(funnel);
}

/* ============================================================
   Chart 1 — 개인문의 추이 vs 전국 사업부 평균
   ============================================================ */
function renderInquiryChart() {
  const container = document.getElementById('chart-inquiry');
  if (!container) return;
  container.innerHTML = '';

  const width = container.clientWidth || 800;
  const height = 380;
  const margin = { top: 28, right: 28, bottom: 44, left: 44 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(months)
    .range([0, innerW])
    .padding(0);

  const y = d3.scaleLinear()
    .domain([0, 32])
    .range([innerH, 0])
    .nice();

  /* Grid */
  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(''));

  /* Axes */
  const xTicks = months.filter((_, i) => i % 3 === 0);
  g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(xTicks).tickSize(4));

  g.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => d + '건'));

  /* Year divider — between 25.02 (idx 11) and 25.03 (idx 12) */
  const dividerX = (x(months[YEAR_DIVIDER_LEFT_IDX]) + x(months[YEAR_DIVIDER_RIGHT_IDX])) / 2;
  g.append('line')
    .attr('class', 'year-divider')
    .attr('x1', dividerX).attr('x2', dividerX)
    .attr('y1', 0).attr('y2', innerH);

  g.append('text')
    .attr('class', 'year-label')
    .attr('x', dividerX - 6)
    .attr('y', 14)
    .attr('text-anchor', 'end')
    .text('1년차');

  g.append('text')
    .attr('class', 'year-label')
    .attr('x', dividerX + 6)
    .attr('y', 14)
    .attr('text-anchor', 'start')
    .text('2년차');

  /* Peer line (dashed) */
  const linePeer = d3.line()
    .x((d, i) => x(months[i]))
    .y(d => y(d));

  const peerPath = g.append('path')
    .datum(peerData)
    .attr('class', 'line-peer')
    .attr('d', linePeer);

  /* Inquiry line */
  const lineInq = d3.line()
    .x((d, i) => x(months[i]))
    .y(d => y(d))
    .curve(d3.curveMonotoneX);

  const inqPath = g.append('path')
    .datum(inquiryData)
    .attr('class', 'line-inquiry')
    .attr('d', lineInq);

  /* Dots */
  const dots = g.selectAll('.dot-inquiry')
    .data(inquiryData)
    .enter()
    .append('circle')
    .attr('class', 'dot-inquiry')
    .attr('cx', (d, i) => x(months[i]))
    .attr('cy', d => y(d))
    .attr('r', 0);

  /* Peak labels (월 → 인덱스) */
  const peaks = [
    { label: '24.12', value: 24 },
    { label: '25.07', value: 28 }
  ].map(p => ({ ...p, idx: months.indexOf(p.label) }));

  const peakG = g.append('g').attr('class', 'peaks').attr('opacity', 0);
  peaks.forEach(p => {
    peakG.append('text')
      .attr('class', 'peak-label')
      .attr('x', x(months[p.idx]))
      .attr('y', y(p.value) - 12)
      .attr('text-anchor', 'middle')
      .text(`${p.value}건`);
  });

  /* Animate */
  const totalLength = inqPath.node().getTotalLength();
  inqPath
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(1600)
    .ease(d3.easeCubicOut)
    .attr('stroke-dashoffset', 0)
    .on('end', () => {
      peakG.transition().duration(400).attr('opacity', 1);
    });

  peerPath
    .attr('stroke-dasharray', `4 4`)
    .attr('opacity', 0)
    .transition()
    .duration(800)
    .delay(800)
    .attr('opacity', 1);

  dots.transition()
    .duration(300)
    .delay((d, i) => 600 + i * 30)
    .attr('r', 4);

  /* Hover */
  dots
    .on('mouseenter', function (event, d) {
      const i = inquiryData.indexOf(d);
      d3.select(this).attr('r', 6);
      const peer = peerData[i];
      const diff = peer > 0 ? Math.round(((d - peer) / peer) * 100) : 0;
      const html = `
        <div class="tooltip__title">${months[i]}</div>
        <div class="tooltip__row"><span>본인 문의</span><span>${d}건</span></div>
        <div class="tooltip__row"><span>전국 사업부 평균</span><span>${peer}건</span></div>
        <div class="tooltip__row tooltip__row--accent"><span>상회율</span><span>${diff >= 0 ? '+' : ''}${diff}%</span></div>
      `;
      showTooltip(html, event);
    })
    .on('mousemove', moveTooltip)
    .on('mouseleave', function () {
      d3.select(this).attr('r', 4);
      hideTooltip();
    });

  /* Legend */
  const legend = g.append('g').attr('transform', `translate(${innerW - 220}, 0)`);
  legend.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 6).attr('y2', 6)
    .attr('stroke', 'var(--accent)').attr('stroke-width', 2);
  legend.append('text').attr('x', 24).attr('y', 10).attr('class', 'legend-text').text('개인문의');

  legend.append('line').attr('x1', 100).attr('x2', 118).attr('y1', 6).attr('y2', 6)
    .attr('stroke', 'var(--text-faint)').attr('stroke-width', 1.5).attr('stroke-dasharray', '4 4');
  legend.append('text').attr('x', 124).attr('y', 10).attr('class', 'legend-text').text('전국 사업부 평균');
}

/* ============================================================
   Chart 2 — 1년차 vs 2년차 비교 (normalized bars)
   ============================================================ */
function renderComparisonChart() {
  const container = document.getElementById('chart-comparison');
  if (!container) return;
  container.innerHTML = '';

  const width = container.clientWidth || 600;
  const height = 360;
  const margin = { top: 24, right: 60, bottom: 50, left: 100 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const data = comparisonData.map(d => ({
    ...d,
    y1Pct: d.y1 / d.y2 * 100,
    y2Pct: 100
  }));

  const y0 = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, innerH])
    .paddingInner(0.4);

  const y1 = d3.scaleBand()
    .domain(['1년차', '2년차'])
    .range([0, y0.bandwidth()])
    .padding(0.15);

  const x = d3.scaleLinear()
    .domain([0, 110])
    .range([0, innerW]);

  g.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y0).tickSize(0).tickPadding(10));

  g.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(4).tickSize(-innerH).tickFormat(''));

  const rows = g.selectAll('.row')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', d => `translate(0,${y0(d.name)})`);

  rows.append('rect')
    .attr('class', 'bar-y1')
    .attr('x', 0)
    .attr('y', y1('1년차'))
    .attr('height', y1.bandwidth())
    .attr('width', 0)
    .transition()
    .duration(900)
    .delay((d, i) => i * 90)
    .ease(d3.easeCubicOut)
    .attr('width', d => x(d.y1Pct));

  rows.append('rect')
    .attr('class', 'bar-y2')
    .attr('x', 0)
    .attr('y', y1('2년차'))
    .attr('height', y1.bandwidth())
    .attr('width', 0)
    .transition()
    .duration(900)
    .delay((d, i) => 200 + i * 90)
    .ease(d3.easeCubicOut)
    .attr('width', d => x(d.y2Pct));

  rows.append('text')
    .attr('class', 'bar-label')
    .attr('x', d => x(d.y1Pct) + 8)
    .attr('y', y1('1년차') + y1.bandwidth() / 2 + 4)
    .attr('opacity', 0)
    .text(d => `${d.y1}${d.unit}`)
    .transition()
    .duration(400)
    .delay((d, i) => 900 + i * 90)
    .attr('opacity', 1);

  rows.append('text')
    .attr('class', 'bar-label')
    .attr('x', d => x(d.y2Pct) + 8)
    .attr('y', y1('2년차') + y1.bandwidth() / 2 + 4)
    .attr('opacity', 0)
    .text(d => `${d.y2}${d.unit}`)
    .transition()
    .duration(400)
    .delay((d, i) => 1100 + i * 90)
    .attr('opacity', 1);

  rows.append('text')
    .attr('class', 'bar-growth')
    .attr('x', innerW + 10)
    .attr('y', y0.bandwidth() / 2 + 4)
    .attr('opacity', 0)
    .text(d => d.growth)
    .transition()
    .duration(400)
    .delay((d, i) => 1300 + i * 90)
    .attr('opacity', 1);

  const legend = svg.append('g').attr('transform', `translate(${margin.left},${height - 16})`);
  legend.append('rect').attr('width', 12).attr('height', 12).attr('class', 'bar-y1');
  legend.append('text').attr('x', 18).attr('y', 10).attr('class', 'legend-text').text('1년차');
  legend.append('rect').attr('x', 80).attr('width', 12).attr('height', 12).attr('class', 'bar-y2');
  legend.append('text').attr('x', 98).attr('y', 10).attr('class', 'legend-text').text('2년차');

  rows.on('mouseenter', function (event, d) {
    const html = `
      <div class="tooltip__title">${d.name}</div>
      <div class="tooltip__row"><span>1년차</span><span>${d.y1}${d.unit}</span></div>
      <div class="tooltip__row"><span>2년차</span><span>${d.y2}${d.unit}</span></div>
      <div class="tooltip__row tooltip__row--accent"><span>성장률</span><span>${d.growth}</span></div>
    `;
    showTooltip(html, event);
  })
  .on('mousemove', moveTooltip)
  .on('mouseleave', hideTooltip);
}

/* ============================================================
   Chart 3 — 블로그 조회수 vs 개인문의 (dual axis)
   ============================================================ */
function renderBlogChart() {
  const container = document.getElementById('chart-blog');
  if (!container) return;
  container.innerHTML = '';

  const width = container.clientWidth || 600;
  const height = 360;
  const margin = { top: 24, right: 50, bottom: 50, left: 50 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(months)
    .range([0, innerW])
    .padding(0.25);

  const yViews = d3.scaleLinear()
    .domain([0, 2500])
    .range([innerH, 0])
    .nice();

  const yInq = d3.scaleLinear()
    .domain([0, 32])
    .range([innerH, 0])
    .nice();

  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(yViews).ticks(4).tickSize(-innerW).tickFormat(''));

  const xTicks = months.filter((_, i) => i % 4 === 0);
  g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(xTicks).tickSize(4));

  const yAxisLeft = g.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(yViews).ticks(4).tickFormat(d => d >= 1000 ? (d/1000) + 'K' : d));
  yAxisLeft.selectAll('text').attr('fill', 'var(--amber)');

  const yAxisRight = g.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${innerW},0)`)
    .call(d3.axisRight(yInq).ticks(4).tickFormat(d => d + '건'));
  yAxisRight.selectAll('text').attr('fill', 'var(--accent)');

  const viewData = viewsData.map((v, i) => ({ month: months[i], value: v, inq: inquiryData[i] }))
    .filter(d => d.value != null);

  g.selectAll('.bar-views')
    .data(viewData)
    .enter()
    .append('rect')
    .attr('class', 'bar-views')
    .attr('x', d => x(d.month))
    .attr('width', x.bandwidth())
    .attr('y', innerH)
    .attr('height', 0)
    .transition()
    .duration(900)
    .delay((d, i) => i * 25)
    .ease(d3.easeCubicOut)
    .attr('y', d => yViews(d.value))
    .attr('height', d => innerH - yViews(d.value));

  const line = d3.line()
    .x((d, i) => x(months[i]) + x.bandwidth() / 2)
    .y(d => yInq(d))
    .curve(d3.curveMonotoneX);

  const path = g.append('path')
    .datum(inquiryData)
    .attr('class', 'line-blog-inquiry')
    .attr('d', line);

  const totalLength = path.node().getTotalLength();
  path
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(1400)
    .delay(400)
    .ease(d3.easeCubicOut)
    .attr('stroke-dashoffset', 0);

  g.selectAll('.dot-blog-inquiry')
    .data(inquiryData)
    .enter()
    .append('circle')
    .attr('class', 'dot-blog-inquiry')
    .attr('cx', (d, i) => x(months[i]) + x.bandwidth() / 2)
    .attr('cy', d => yInq(d))
    .attr('r', 0)
    .transition()
    .duration(200)
    .delay((d, i) => 600 + i * 25)
    .attr('r', 3);

  g.selectAll('.hover-col')
    .data(months)
    .enter()
    .append('rect')
    .attr('class', 'hover-col')
    .attr('x', d => x(d))
    .attr('y', 0)
    .attr('width', x.bandwidth())
    .attr('height', innerH)
    .attr('fill', 'transparent')
    .attr('pointer-events', 'all')
    .on('mouseenter', function (event, m) {
      const i = months.indexOf(m);
      const v = viewsData[i];
      const inq = inquiryData[i];
      const html = `
        <div class="tooltip__title">${m}</div>
        <div class="tooltip__row"><span>조회수</span><span>${v == null ? '—' : v.toLocaleString('en-US')}</span></div>
        <div class="tooltip__row tooltip__row--accent"><span>개인문의</span><span>${inq}건</span></div>
      `;
      showTooltip(html, event);
    })
    .on('mousemove', moveTooltip)
    .on('mouseleave', hideTooltip);

  const legend = g.append('g').attr('transform', `translate(${innerW - 180}, -8)`);
  legend.append('rect').attr('width', 12).attr('height', 12).attr('class', 'bar-views');
  legend.append('text').attr('x', 18).attr('y', 10).attr('class', 'legend-text').text('조회수');
  legend.append('line').attr('x1', 80).attr('x2', 98).attr('y1', 7).attr('y2', 7)
    .attr('stroke', 'var(--accent)').attr('stroke-width', 1.8);
  legend.append('text').attr('x', 104).attr('y', 10).attr('class', 'legend-text').text('개인문의');
}

/* ============================================================
   Scroll-triggered chart rendering (with immediate-viewport check)
   ============================================================ */
const chartConfigs = [
  { id: 'chart-inquiry',    render: renderInquiryChart },
  { id: 'chart-comparison', render: renderComparisonChart },
  { id: 'chart-blog',       render: renderBlogChart }
];

const renderedCharts = new Set();

function setupChartObservers() {
  chartConfigs.forEach(({ id, render }) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (isInViewport(el)) {
      render();
      renderedCharts.add(id);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          render();
          renderedCharts.add(id);
          io.disconnect();
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

    io.observe(el);
  });

  // Safety net for late-loading charts
  setTimeout(() => {
    chartConfigs.forEach(({ id, render }) => {
      if (renderedCharts.has(id)) return;
      const el = document.getElementById(id);
      if (el && isInViewport(el)) {
        render();
        renderedCharts.add(id);
      }
    });
  }, 600);
}

/* -------- Resize handler -------- */
let resizeTimer;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    chartConfigs.forEach(({ id, render }) => {
      if (renderedCharts.has(id)) render();
    });
  }, 250);
}

/* ============================================================
   Init
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
