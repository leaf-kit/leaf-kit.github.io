/* ===== Theme Toggle ===== */
(function(){
  const saved = localStorage.getItem('theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
  else if(matchMedia('(prefers-color-scheme:dark)').matches) document.documentElement.setAttribute('data-theme','dark');
})();

function toggleTheme(){
  const html = document.documentElement;
  const next = html.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.getElementById('theme-toggle');
  if(btn) btn.textContent = next==='dark' ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('theme-toggle');
  if(btn){
    btn.textContent = document.documentElement.getAttribute('data-theme')==='dark' ? '☀️' : '🌙';
    btn.addEventListener('click', toggleTheme);
  }
});

/* ===== Tab Switching ===== */
function initTabs(){
  document.querySelectorAll('.tabs').forEach(tabBar=>{
    const btns = tabBar.querySelectorAll('.tab-btn');
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const target = btn.dataset.tab;
        btns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const parent = tabBar.parentElement;
        parent.querySelectorAll('.tab-content').forEach(tc=>{
          tc.classList.toggle('active', tc.id===target);
        });
      });
    });
  });
}

/* ===== Company Accordion ===== */
function initAccordion(){
  document.querySelectorAll('.company-card-header').forEach(header=>{
    header.addEventListener('click', ()=>{
      const detail = header.nextElementSibling;
      if(detail && detail.classList.contains('company-detail')){
        detail.classList.toggle('open');
        const toggle = header.querySelector('.company-toggle');
        if(toggle) toggle.textContent = detail.classList.contains('open') ? '▲' : '▼';
      }
    });
  });
}

/* ===== Utility ===== */
function formatFolderId(id){
  if(!id || id.length!==10) return id;
  return `20${id.slice(0,2)}년 ${id.slice(2,4)}월 ${id.slice(4,6)}일 ${id.slice(6,8)}:${id.slice(8,10)}`;
}

function getCategoryColor(cat){
  const map = {AI:'#7C3AED',Dev:'#3B82F6',Design:'#EC4899','기획':'#F97316',Data:'#10B981',Infra:'#6366F1',Web3:'#8B5CF6',Research:'#06B6D4',Robotics:'#F59E0B'};
  return map[cat]||'#6366F1';
}

function createTag(keyword, cat, delta){
  const t = document.createElement('span');
  t.className = 'tag';
  t.setAttribute('data-cat', cat||'');
  let html = keyword;
  if(delta !== undefined && delta !== null){
    const cls = delta>0?'up':'down';
    const sign = delta>0?'+':'';
    html += ` <span class="delta ${cls}">${sign}${delta}</span>`;
  }
  t.innerHTML = html;
  return t;
}

/* ===== Load Index Page ===== */
async function loadIndex(){
  try{
    const res = await fetch('/data/index.json');
    if(!res.ok) throw new Error('Failed to load index');
    const data = await res.json();
    renderTimeline(data);
    renderKeywordScroll(data);
    renderLiveBadge(data);
    await renderChart(data);
  }catch(e){
    console.error('Index load error:', e);
    // Try relative path
    try{
      const res = await fetch('data/index.json');
      const data = await res.json();
      renderTimeline(data);
      renderKeywordScroll(data);
      renderLiveBadge(data);
      await renderChart(data);
    }catch(e2){
      console.error('Fallback load error:', e2);
    }
  }
}

function renderLiveBadge(data){
  const el = document.getElementById('live-info');
  if(!el) return;
  el.textContent = `누적 수집 중 · 총 ${data.total_collections}회차 · 최신: ${data.collections[0]?.label||''}`;
}

function renderKeywordScroll(data){
  const container = document.getElementById('keyword-scroll');
  if(!container) return;
  const latest = data.collections[0];
  if(!latest) return;
  // Load tech_keywords from latest
  fetch(`data/${latest.folder_id}/tech_keywords.json`)
    .then(r=>r.json())
    .then(keywords=>{
      const sorted = [...keywords].sort((a,b)=>b.count-a.count).slice(0,10);
      sorted.forEach(kw=>{
        container.appendChild(createTag(`${kw.keyword} (${kw.count})`, kw.category, kw.delta));
      });
    }).catch(()=>{
      // fallback: use top_keywords from index
      (latest.top_keywords||[]).forEach(kw=>{
        container.appendChild(createTag(kw, 'AI'));
      });
    });
}

function renderTimeline(data){
  const container = document.getElementById('timeline');
  if(!container) return;
  container.innerHTML = '';
  data.collections.forEach((col, i)=>{
    const item = document.createElement('div');
    item.className = 'timeline-item';
    const isNew = i===0;
    item.innerHTML = `
      <div class="timeline-card">
        <div class="timeline-header">
          <span class="timeline-date">${col.label}</span>
          <span>
            ${isNew?'<span class="new-badge">NEW</span>':''}
            <span class="folder-badge">${col.folder_id}</span>
          </span>
        </div>
        <div class="timeline-summary">${col.summary}</div>
        <div class="timeline-tags">
          ${(col.top_keywords||[]).map(k=>`<span class="tag" data-cat="AI">${k}</span>`).join('')}
        </div>
        <div class="timeline-links">
          <a href="pages/${col.folder_id}/">📄 상세 보기</a>
          <a href="data/${col.folder_id}/global_top100.md">🌐 글로벌.md</a>
          <a href="data/${col.folder_id}/korea_top100.md">🇰🇷 국내.md</a>
          <a href="data/${col.folder_id}/tech_keywords.json">📊 JSON</a>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

/* ===== Chart (Chart.js) ===== */
let trendChart = null;
async function renderChart(data){
  const canvas = document.getElementById('trend-chart');
  if(!canvas || typeof Chart==='undefined') return;

  const allKeywords = new Map();
  const labels = [];

  // Load keywords from all collections (reverse for chronological)
  const collections = [...data.collections].reverse();
  for(const col of collections){
    labels.push(col.label.replace('년 ','.').replace('월 ','.').replace('일 ',''));
    try{
      const res = await fetch(`data/${col.folder_id}/tech_keywords.json`);
      const keywords = await res.json();
      keywords.forEach(kw=>{
        if(!allKeywords.has(kw.keyword)) allKeywords.set(kw.keyword, []);
        allKeywords.get(kw.keyword).push({label:col.label, count:kw.count});
      });
    }catch(e){}
  }

  const colors = ['#6366F1','#F59E0B','#EF4444','#10B981','#3B82F6','#EC4899','#8B5CF6','#06B6D4','#F97316','#84CC16'];
  const datasets = [];
  let ci = 0;

  // Top 8 keywords by latest count
  const topKw = [...allKeywords.entries()]
    .sort((a,b)=>(b[1][b[1].length-1]?.count||0)-(a[1][a[1].length-1]?.count||0))
    .slice(0,8);

  topKw.forEach(([name, points])=>{
    const color = colors[ci%colors.length];
    datasets.push({
      label: name,
      data: collections.map(col=>{
        const pt = points.find(p=>p.label===col.label);
        return pt?pt.count:0;
      }),
      borderColor: color,
      backgroundColor: color+'20',
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    });
    ci++;
  });

  // Render toggles
  const toggleContainer = document.getElementById('chart-toggles');
  if(toggleContainer){
    toggleContainer.innerHTML = '';
    datasets.forEach((ds, idx)=>{
      const label = document.createElement('label');
      label.className = 'chart-toggle';
      label.innerHTML = `<input type="checkbox" checked data-idx="${idx}"><span style="color:${ds.borderColor}">${ds.label}</span>`;
      label.querySelector('input').addEventListener('change', e=>{
        trendChart.data.datasets[idx].hidden = !e.target.checked;
        trendChart.update();
      });
      toggleContainer.appendChild(label);
    });
  }

  trendChart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { display:false },
        tooltip: { mode:'index', intersect:false }
      },
      scales: {
        y: { beginAtZero:true, grid:{color:'rgba(100,100,100,.1)'} },
        x: { grid:{display:false} }
      }
    }
  });
}

/* ===== Detail Page Load ===== */
async function loadDetailPage(folderId){
  try{
    const basePath = `../../data/${folderId}/`;

    // Load meta
    const metaRes = await fetch(basePath+'meta.json');
    const meta = await metaRes.json();

    // Render page header info
    const headerEl = document.getElementById('page-title');
    if(headerEl) headerEl.textContent = formatFolderId(folderId) + ' 수집본';

    const summaryEl = document.getElementById('page-summary');
    if(summaryEl) summaryEl.textContent = meta.summary;

    // Summary banner
    const bannerEl = document.getElementById('summary-banner');
    if(bannerEl){
      bannerEl.innerHTML = `
        <div class="summary-stat"><div class="num">${meta.sources_count||0}</div><div class="label">수집 소스</div></div>
        <div class="summary-stat"><div class="num">${meta.scope?.global_top100?'100':'0'}</div><div class="label">글로벌 기업</div></div>
        <div class="summary-stat"><div class="num">${meta.scope?.korea_top100?'100':'0'}</div><div class="label">국내 기업</div></div>
        <div class="summary-stat"><div class="num">${meta.scope?.tech_keywords?'15':'0'}</div><div class="label">기술 키워드</div></div>
      `;
    }

    // Navigation
    if(meta.prev_folder){
      const prevEl = document.getElementById('prev-link');
      if(prevEl){ prevEl.href = `../../../pages/${meta.prev_folder}/`; prevEl.style.visibility='visible'; }
    }
    if(meta.next_folder){
      const nextEl = document.getElementById('next-link');
      if(nextEl){ nextEl.href = `../../../pages/${meta.next_folder}/`; nextEl.style.visibility='visible'; }
    }

    // Load all data in parallel
    const [globalRes, koreaRes, keywordsRes, jobsRes, newsRes] = await Promise.all([
      fetch(basePath+'global_top100.json').then(r=>r.json()).catch(()=>[]),
      fetch(basePath+'korea_top100.json').then(r=>r.json()).catch(()=>[]),
      fetch(basePath+'tech_keywords.json').then(r=>r.json()).catch(()=>[]),
      fetch(basePath+'jobs_trend.json').then(r=>r.json()).catch(()=>({})),
      fetch(basePath+'news_links.json').then(r=>r.json()).catch(()=>[])
    ]);

    renderHotKeywords(keywordsRes);
    renderCompanyGrid('global-companies', globalRes, folderId);
    renderCompanyGrid('korea-companies', koreaRes, folderId);
    renderKeywordsTab(keywordsRes);
    renderJobsTab(jobsRes);
    renderNewsTab(newsRes);
    renderOrgCharts(globalRes, koreaRes, basePath);
    renderDataFiles(folderId);

    initTabs();
    initAccordion();

  }catch(e){
    console.error('Detail page load error:', e);
  }
}

function renderHotKeywords(keywords){
  const container = document.getElementById('hot-keywords');
  if(!container) return;
  const sorted = [...keywords].sort((a,b)=>b.delta-a.delta).slice(0,5);
  container.innerHTML = '';
  sorted.forEach((kw, i)=>{
    const card = document.createElement('div');
    card.className = 'hot-keyword-card';
    const cls = kw.delta>0?'up':'down';
    const sign = kw.delta>0?'+':'';
    card.innerHTML = `
      <div class="hot-rank">${i+1}</div>
      <div class="hot-info">
        <div class="kw-name">${kw.keyword}</div>
        <div class="kw-delta ${cls}">${kw.trend} ${sign}${kw.delta}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCompanyGrid(containerId, companies, folderId){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';
  companies.forEach(company=>{
    const card = document.createElement('div');
    card.className = 'company-card';
    const tags = (company.tech_keywords||[]).slice(0,5).map(k=>`<span class="tag" data-cat="Dev">${k}</span>`).join('');
    const newsHtml = (company.news||[]).map(n=>`<li><a href="${n.url}" target="_blank">${n.title}</a> <small>${n.date}</small></li>`).join('');
    const jobsHtml = (company.jobs_trend||[]).map(j=>`<span class="tag" data-cat="기획">${j}</span>`).join(' ');
    const mcap = company.market_cap_usd_B ? (company.market_cap_krw_T ? `시총 ${company.market_cap_krw_T}조원` : `시총 $${company.market_cap_usd_B}B`) : '';

    card.innerHTML = `
      <div class="company-card-header">
        <div class="company-rank">#${company.rank}</div>
        <div class="company-info">
          <div class="company-name">${company.name} ${company.ticker?'('+company.ticker+')':''}</div>
          <div class="company-meta">${company.ceo||''} · ${mcap}</div>
          <div class="company-tags">${tags}</div>
        </div>
        <span class="company-toggle">▼</span>
      </div>
      <div class="company-detail">
        <h4>전략 방향</h4>
        <p>${company.strategy||''}</p>
        ${company.recent_reorg?`<h4>최근 조직개편</h4><p>${company.recent_reorg}</p>`:''}
        <h4>관련 기업</h4>
        <p>${(company.related_companies||[]).join(', ')}</p>
        <h4>채용 트렌드</h4>
        <div>${jobsHtml}</div>
        ${newsHtml?`<h4>관련 기사</h4><ul>${newsHtml}</ul>`:''}
        <div class="data-links">
          <a href="../../data/${folderId}/global_top100.md">📄 .md</a>
          <a href="../../data/${folderId}/global_top100.json">📊 .json</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderKeywordsTab(keywords){
  const container = document.getElementById('keywords-content');
  if(!container) return;
  const sorted = [...keywords].sort((a,b)=>b.count-a.count);
  let html = '<table class="jobs-table"><thead><tr><th>키워드</th><th>카테고리</th><th>빈도</th><th>변화</th><th>트렌드</th></tr></thead><tbody>';
  sorted.forEach(kw=>{
    const sign = kw.delta>0?'+':'';
    const cls = kw.delta>0?'up':'down';
    html += `<tr><td><strong>${kw.keyword}</strong></td><td><span class="tag" data-cat="${kw.category}">${kw.category}</span></td><td>${kw.count}</td><td class="kw-delta ${cls}">${sign}${kw.delta}</td><td>${kw.trend}</td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderJobsTab(data){
  const container = document.getElementById('jobs-content');
  if(!container || !data.categories) return;
  container.innerHTML = '';
  data.categories.forEach(cat=>{
    let html = `<div class="jobs-category"><h3>${cat.name}</h3>`;
    html += '<table class="jobs-table"><thead><tr><th>직군</th><th>수요</th><th>채용공고</th><th>변화</th><th>핵심 스킬</th></tr></thead><tbody>';
    cat.roles.forEach(role=>{
      const sign = role.delta>0?'+':'';
      html += `<tr><td><strong>${role.title}</strong></td><td>${role.demand}</td><td>${role.count}</td><td>${sign}${role.delta}</td><td>${(role.skills||[]).map(s=>`<span class="tag" data-cat="Dev" style="font-size:.7rem;padding:.1rem .3rem">${s}</span>`).join(' ')}</td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML += html;
  });
}

function renderNewsTab(news){
  const container = document.getElementById('news-content');
  if(!container) return;
  container.innerHTML = '<div class="news-list">' + news.map(n=>`
    <div class="news-item">
      <span class="news-source">${n.source||''}</span>
      <a class="news-title" href="${n.url||'#'}" target="_blank">${n.title}</a>
      <span class="news-date">${n.date||''}</span>
    </div>
  `).join('') + '</div>';
}

async function renderOrgCharts(globalCo, koreaCo, basePath){
  const container = document.getElementById('org-content');
  if(!container) return;
  container.innerHTML = '';

  const orgs = ['samsung','naver','microsoft'];
  for(const name of orgs){
    try{
      const res = await fetch(basePath+`org_charts/${name}.json`);
      const data = await res.json();
      let html = `<div class="org-tree"><h3>${data.company}</h3>`;
      html += `<div class="org-node"><span class="org-node-label ceo">CEO: ${data.ceo}</span>`;
      html += '<div class="org-children">';
      (data.divisions||[]).forEach(div=>{
        html += `<div class="org-node"><span class="org-node-label division">${div.name} — ${div.head}</span>`;
        html += '<div class="org-children">';
        (div.teams||[]).forEach(t=>{
          html += `<div class="org-node"><span class="org-node-label">${t}</span></div>`;
        });
        html += '</div></div>';
      });
      html += '</div></div></div>';
      container.innerHTML += html;
    }catch(e){}
  }
}

function renderDataFiles(folderId){
  const container = document.getElementById('data-files');
  if(!container) return;
  const files = [
    'meta.json','global_top100.md','global_top100.json','global_top100.jsonl',
    'korea_top100.md','korea_top100.json','korea_top100.jsonl',
    'tech_keywords.md','tech_keywords.json','tech_keywords.jsonl',
    'jobs_trend.md','jobs_trend.json','news_links.md','news_links.json'
  ];
  container.innerHTML = `<h3>📁 이 회차 데이터 파일</h3><div class="data-files-grid">` +
    files.map(f=>`<a class="data-file-link" href="../../data/${folderId}/${f}">📄 ${f}</a>`).join('') +
    '</div>';
}

/* ===== Search ===== */
function initSearch(){
  const input = document.getElementById('search-input');
  if(!input) return;
  input.addEventListener('input', ()=>{
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll('.timeline-item').forEach(item=>{
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) || q==='' ? '' : 'none';
    });
  });
}

/* ===== Filter ===== */
function initFilter(){
  document.querySelectorAll('.filter-pill').forEach(pill=>{
    pill.addEventListener('click', ()=>{
      pill.classList.toggle('active');
      // Filter logic could be expanded
    });
  });
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  initTabs();
  initAccordion();
  initSearch();
  initFilter();
});
