// DevPulse site. It only reads files that Bob and the scoring script wrote.
import './app.css';

import r1Findings from '../audit/findings.json';
import r1Metrics from '../audit/metrics.json';
import r1Truth from '../audit/ground_truth.json';
import r2Findings from '../audit/hard/findings.json';
import r2Metrics from '../audit/hard/metrics.json';
import r2Truth from '../audit/hard/ground_truth.json';
import runs from '../audit/runs.json';
import r1Sarif from '../audit/findings.sarif?url';
import r2Sarif from '../audit/hard/findings.sarif?url';
import auditSkill from '../.bob/skills/security-audit/SKILL.md?raw';
import fixesSkill from '../.bob/skills/generate-fixes/SKILL.md?raw';
import customModes from '../.bob/custom_modes.yaml?raw';

const diffs = import.meta.glob(['../audit/fixes/*.diff', '../audit/hard/fixes/*.diff'], { query: '?raw', import: 'default', eager: true });
const shots = import.meta.glob('../bob_sessions/*.png', { import: 'default', eager: true });

const ROUNDS = [
  { key: 'r1', short: 'Round 1', label: 'Warm-up', target: 'sample_app/', blurb: 'Login and user API, fairly obvious bugs', f: r1Findings, m: r1Metrics, gt: r1Truth, sarif: r1Sarif },
  { key: 'r2', short: 'Round 2', label: 'Hard', target: 'ledger_app/', blurb: 'Invoicing API, subtler bugs plus traps', f: r2Findings, m: r2Metrics, gt: r2Truth, sarif: r2Sarif },
];
const done = (r) => !r.m.pending;

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pct = (x) => `${Math.round((x ?? 0) * 100)}%`;
const SEV = { high: 'High', medium: 'Medium', low: 'Low' };
const sevOrder = { high: 0, medium: 1, low: 2 };
const locs = (d) => d.locations ?? [{ file: d.file, line: d.line }];

// ---------- routing ----------
let mermaidDone = false;
function go(tab, push = true) {
  if (!document.getElementById(`tab-${tab}`)) tab = 'overview';
  $$('.tabs [role=tab]').forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  $$('.pane').forEach((p) => p.classList.toggle('active', p.id === `tab-${tab}`));
  if (push) history.replaceState(null, '', `#${tab}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (tab === 'how' && !mermaidDone) {
    mermaidDone = true;
    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', themeVariables: { fontFamily: 'IBM Plex Sans', lineColor: '#8d8d8d' } });
      mermaid.run({ nodes: [$('#pipeline')] });
    });
  }
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab],[data-go]');
  if (!t) return;
  e.preventDefault();
  go(t.dataset.tab || t.dataset.go);
});

// ---------- overview ----------
function renderOverview() {
  const complete = ROUNDS.filter(done);
  const seeded = complete.reduce((a, r) => a + r.m.seeded, 0);
  const caught = complete.reduce((a, r) => a + r.m.caught, 0);
  const reported = complete.reduce((a, r) => a + r.m.reported, 0);
  const fixes = complete.reduce((a, r) => a + r.m.fixed, 0);
  const apply = complete.reduce((a, r) => a + (r.m.fixes_apply_cleanly ?? 0), 0);
  const decoys = complete.reduce((a, r) => a + (r.m.decoys ?? 0), 0);
  const decoyHits = complete.reduce((a, r) => a + (r.m.decoy_hits ?? 0), 0);
  const coins = runs.tasks.reduce((a, t) => a + (t.bobcoins ?? 0), 0);

  const fa = reported - caught;
  const kpis = [
    { v: `${caught} of ${seeded}`, l: 'planted bugs found' },
    { v: `${fa}`, l: fa === 1 ? 'false alarm' : 'false alarms' },
    decoys ? { v: `${decoyHits} of ${decoys}`, l: 'traps it fell for' } : null,
    { v: `${apply} of ${fixes}`, l: 'patches that apply' },
    { v: coins.toFixed(1), l: 'Bobcoins used (of 40)' },
  ].filter(Boolean);
  $('#hero-kpis').innerHTML = kpis.map((k) => `<div class="stat"><div class="stat-v">${k.v}</div><div class="stat-l">${k.l}</div></div>`).join('');
  $('#h-total').textContent = String(ROUNDS.reduce((a, r) => a + r.gt.defects.length, 0));
  const pendingRounds = ROUNDS.filter((r) => !done(r));
  const fixPending = complete.some((r) => r.m.fixed === 0);
  $('#hero-note').textContent = pendingRounds.length
    ? `So far this covers ${complete.map((r) => r.short.toLowerCase()).join(' and ')}. ${pendingRounds.map((r) => r.short).join(', ')} hasn't run yet.`
    : fixPending
      ? 'Both rounds combined. Round 2 patches are still being written, so the patch count only covers round 1 for now.'
      : 'Both rounds combined.';

  const v = runs.verification?.[0];
  if (v) {
    $('#catch-broken').textContent = `${v.total - v.first_attempt_clean} of ${v.total}`;
    const bar = (label, n, cls) => `
      <div class="bar-row"><div class="bar-label">${label}</div>
        <div class="bar"><div class="bar-fill ${cls}" style="--w:${(n / v.total) * 100}%"></div></div>
        <div class="bar-n">${n}/${v.total}</div></div>`;
    $('#catch-viz').innerHTML = `
      ${bar('Applied as Bob wrote them', v.first_attempt_clean, 'bad')}
      ${bar('After we fixed the line numbers (same code)', v.after_verification_clean, 'good')}`;
  }

  const row = (r) => {
    const m = r.m;
    const coinsR = runs.tasks.filter((t) => t.round === Number(r.short.slice(-1))).reduce((a, t) => a + t.bobcoins, 0);
    const cell = (x) => (done(r) ? x : '<span class="muted">not yet</span>');
    return `<tr>
      <td><strong>${r.short}</strong><div class="muted small">${r.label}</div></td>
      <td><code>${r.target}</code><div class="muted small">${r.blurb}</div></td>
      <td class="num">${m.seeded}</td>
      <td class="num">${m.decoys || '—'}</td>
      <td class="num">${cell(`<b>${m.caught}/${m.seeded}</b>`)}</td>
      <td class="num">${cell(String(m.false_positives))}</td>
      <td class="num">${m.decoys ? cell(`${m.decoy_hits}/${m.decoys}`) : '—'}</td>
      <td class="num">${done(r) && m.fixed ? `${m.fixes_apply_cleanly ?? 0}/${m.fixed}` : '<span class="muted">in progress</span>'}</td>
      <td class="num">${coinsR ? coinsR.toFixed(2) : cell('—')}</td>
    </tr>`;
  };
  $('#rounds-table').innerHTML = `<thead><tr><th>Round</th><th>App</th><th class="num">Bugs</th><th class="num">Traps</th><th class="num">Found</th><th class="num">False alarms</th><th class="num">Fell for traps</th><th class="num">Patches apply</th><th class="num">Bobcoins</th></tr></thead><tbody>${ROUNDS.map(row).join('')}</tbody>`;
}

// ---------- findings ----------
let current = ROUNDS.find(done) ? ROUNDS.filter(done).at(-1) : ROUNDS[0];
let sevFilter = 'all';
let selected = null;

function roundSeg(el, onPick) {
  el.innerHTML = ROUNDS.map((r) => `<button data-round="${r.key}" class="${r === current ? 'on' : ''}">${r.short}<span>${r.label}</span></button>`).join('');
  $$('button', el).forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    current = ROUNDS.find((r) => r.key === b.dataset.round);
    selected = null;
    renderFindings();
    renderBenchmark();
  }));
}

function renderFindings() {
  roundSeg($('#round-seg'));
  const r = current;
  const fs = r.f.findings ?? [];
  const run = r.f.run ?? {};
  const pending = fs.length === 0;
  $('#pending-banner').hidden = !pending;
  $('#pending-banner').innerHTML = `Bob hasn't looked at <code>${r.target}</code> yet.`;
  $('#run-summary').innerHTML = pending
    ? `${r.short} · ${r.label} · <code>${r.target}</code>`
    : `${fs.length} things Bob flagged in <code>${r.target}</code>, using ${run.subagents?.length || 'several'} subagents in parallel.${run.date ? ` Run on ${new Date(run.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}.` : ''}`;
  $('#sarif-link').href = r.sarif;
  $('#sarif-link').setAttribute('download', `devpulse-${r.key}.sarif`);
  $('#sarif-link').hidden = pending;

  const count = (s) => fs.filter((f) => f.severity === s).length;
  const applyOk = Object.values(r.m.fix_apply_status ?? {}).filter((v) => v === 'clean').length;
  $('#sev-row').innerHTML = [
    ['high', count('high'), 'High'],
    ['medium', count('medium'), 'Medium'],
    ['low', count('low'), 'Low'],
    ['ok', `${applyOk}/${fs.length}`, 'Patches apply'],
  ].map(([c, n, l]) => `<div class="sev sev-${c}"><b>${n}</b><span>${l}</span></div>`).join('');

  $('#sev-filter').innerHTML = ['all', 'high', 'medium', 'low'].map((s) => `<button data-sev="${s}" class="${s === sevFilter ? 'on' : ''}">${s === 'all' ? 'All' : SEV[s]}</button>`).join('');
  $$('#sev-filter button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); sevFilter = b.dataset.sev; renderFindings(); }));

  const list = fs
    .filter((f) => sevFilter === 'all' || f.severity === sevFilter)
    .sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);
  const caughtBy = new Map((r.m.caught_ids ?? []).map((c) => [c.finding, c.defect]));
  $('#findings-list').innerHTML = pending
    ? '<li class="empty">Nothing yet.</li>'
    : list.map((f) => `
      <li><button class="finding ${selected === f.id ? 'on' : ''}" data-id="${esc(f.id)}">
        <span class="sev-dot ${f.severity}" aria-label="${SEV[f.severity]}"></span>
        <span class="f-main"><span class="f-title">${esc(f.title)}</span>
          <span class="f-meta"><code>${esc(f.file.replace(r.target, ''))}:${f.line}</code> · ${esc(f.asvs)}</span></span>
        <span class="f-tags">${caughtBy.has(f.id) ? '<span class="tag ok" title="This matches one of the bugs we planted">real bug</span>' : done(r) ? '<span class="tag warn" title="This doesn\'t match any bug we planted">false alarm</span>' : ''}
          ${r.m.fix_apply_status?.[f.id] === 'clean' ? '<span class="tag fix">patch ok</span>' : ''}</span>
      </button></li>`).join('');
  $$('#findings-list .finding').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); select(b.dataset.id); if (window.innerWidth < 980) $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  if (!pending) select(selected && fs.some((f) => f.id === selected) ? selected : list[0]?.id);
  else $('#detail').innerHTML = '<div class="empty-detail"><p>Nothing here yet.</p></div>';
}

function diffHtml(text) {
  return text.split('\n').filter((l) => !l.startsWith('diff --git') && !l.startsWith('index ')).map((l) => {
    const c = l.startsWith('+++') || l.startsWith('---') ? 'd-file' : l.startsWith('@@') ? 'd-hunk' : l.startsWith('+') ? 'd-add' : l.startsWith('-') ? 'd-del' : '';
    return `<span class="${c}">${esc(l) || ' '}</span>`;
  }).join('');
}

function select(id) {
  const r = current;
  const f = (r.f.findings ?? []).find((x) => x.id === id);
  if (!f) return;
  selected = id;
  $$('#findings-list .finding').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
  const d = f.fix_diff ? diffs[`../${f.fix_diff}`] : null;
  const applies = r.m.fix_apply_status?.[f.id];
  $('#detail').innerHTML = `
    <div class="detail-head">
      <span class="pill ${f.severity}">${SEV[f.severity]}</span>
      <span class="pill ghost">${esc(f.asvs)}</span>
      <span class="pill ghost">${esc(f.category)}</span>
      <span class="muted small">${esc(f.id)}</span>
    </div>
    <h3>${esc(f.title)}</h3>
    <p class="detail-exp">${esc(f.explanation)}</p>
    <p class="label">The line Bob flagged <span class="muted"><code>${esc(f.file)}:${f.line}</code></span></p>
    <pre class="code evidence">${esc(f.evidence)}</pre>
    <p class="label">Bob's patch ${applies === 'clean' ? '<span class="tag fix">applies cleanly</span>' : applies ? '<span class="tag warn">doesn\'t apply</span>' : ''}</p>
    ${d ? `<pre class="code diff">${diffHtml(d)}</pre>` : '<p class="muted">Bob hasn\'t written a patch for this one yet.</p>'}`;
}

// ---------- benchmark ----------
function renderBenchmark() {
  roundSeg($('#round-seg-2'));
  const r = current;
  const m = r.m;
  const cards = [
    ['Bugs found', done(r) ? `${m.caught} of ${m.seeded}` : '-', ''],
    ['False alarms', done(r) ? String(m.false_positives) : '-', ''],
    ['Traps it fell for', m.decoys ? (done(r) ? `${m.decoy_hits} of ${m.decoys}` : '-') : 'none set', ''],
    ['Patches that apply', done(r) && m.fixed ? `${m.fixes_apply_cleanly ?? 0} of ${m.fixed}` : 'in progress', ''],
  ];
  $('#metric-row').innerHTML = cards.map(([l, v, s]) => `<div class="card metric"><div class="metric-l">${l}</div><div class="metric-v">${v}</div><div class="muted small">${s}</div></div>`).join('');
  const caught = new Map((m.caught_ids ?? []).map((c) => [c.defect, c.finding]));
  $('#gt-list').innerHTML = r.gt.defects.map((d) => {
    const hit = caught.get(d.id);
    const st = !done(r) ? '<span class="tag">not yet</span>' : hit ? `<span class="tag ok">found (${hit})</span>` : '<span class="tag warn">missed</span>';
    const l = locs(d)[0];
    return `<li><span class="sev-dot ${d.severity}"></span><div><div class="gt-t">${esc(d.summary)}</div><div class="muted small"><code>${esc(l.file.replace(r.target, ''))}:${l.line}</code> · ${esc(d.category)} · ${esc(d.asvs)}</div></div>${st}</li>`;
  }).join('');
  const hits = new Map((m.decoy_hit_ids ?? []).map((h) => [h.decoy, h.finding]));
  const decoys = r.gt.decoys ?? [];
  $('#decoy-list').innerHTML = decoys.map((d) => {
    const h = hits.get(d.id);
    const st = !done(r) ? '<span class="tag">not yet</span>' : h ? `<span class="tag warn">fell for it (${h})</span>` : '<span class="tag ok">not fooled</span>';
    return `<li><span class="sev-dot decoy"></span><div><div class="gt-t">Looks like ${esc(d.looks_like)}</div><div class="muted small">${esc(d.why_safe)}. <code>${esc(d.file.replace(r.target, ''))}</code></div></div>${st}</li>`;
  }).join('');
  $('#decoy-empty').textContent = decoys.length ? '' : 'No traps in round 1. That came later.';
}

// ---------- how ----------
function renderHow() {
  $('#src-mode').textContent = customModes;
  $('#src-audit').textContent = auditSkill;
  $('#src-fixes').textContent = fixesSkill;
}

// ---------- evidence ----------
function renderEvidence() {
  const url = (name) => shots[`../bob_sessions/${name}`];
  $('#runs-table').innerHTML = `<thead><tr><th>Task</th><th>What we asked</th><th>Mode</th><th>Subagents</th><th class="num">Bobcoins</th><th>What happened</th></tr></thead><tbody>${runs.tasks.map((t) => `
    <tr><td><b>${t.task}</b><div class="muted small">Round ${t.round}</div></td>
      <td>${esc(t.title)}${url(t.screenshot) ? `<div><button class="link small" data-shot="${esc(t.screenshot)}">see screenshot</button></div>` : ''}</td>
      <td>${esc(t.mode)}${t.skill ? `<div class="muted small">${esc(t.skill)}</div>` : ''}</td>
      <td class="small">${esc(t.subagents ?? '—')}</td>
      <td class="num"><b>${t.bobcoins.toFixed(3)}</b><div class="muted small">${esc(t.context ?? '')}</div></td>
      <td class="small">${esc(t.outcome)}</td></tr>`).join('')}
    <tr class="total"><td colspan="4">Total</td><td class="num"><b>${runs.tasks.reduce((a, t) => a + t.bobcoins, 0).toFixed(3)}</b><div class="muted small">of 40</div></td><td></td></tr></tbody>`;
  const entries = Object.entries(shots).sort(([a], [b]) => a.localeCompare(b));
  $('#gallery').innerHTML = entries.map(([p, u]) => {
    const n = p.split('/').pop();
    return `<figure class="card shot"><button data-shot="${esc(n)}" aria-label="Enlarge ${esc(n)}"><img src="${u}" alt="Bob task session summary ${esc(n)}" loading="lazy"></button><figcaption><code>bob_sessions/${esc(n)}</code></figcaption></figure>`;
  }).join('');
  const lb = $('#lightbox');
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-shot]');
    if (b) { $('img', lb).src = url(b.dataset.shot); lb.hidden = false; return; }
    if (!lb.hidden && (e.target === lb || e.target.closest('#lightbox button'))) lb.hidden = true;
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.hidden = true; });
}

renderOverview();
renderFindings();
renderBenchmark();
renderHow();
renderEvidence();
go(location.hash.slice(1) || 'overview', false);
window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'overview', false));
