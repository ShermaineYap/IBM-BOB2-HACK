// DevPulse dashboard. Renders what Bob wrote to audit/ — no AI runs here.
import mermaid from 'mermaid';
import './style.css';

import findingsFile from '../audit/findings.json';
import groundTruth from '../audit/ground_truth.json';
import metrics from '../audit/metrics.json';
import auditSkill from '../.bob/skills/security-audit/SKILL.md?raw';
import fixesSkill from '../.bob/skills/generate-fixes/SKILL.md?raw';

const fixDiffs = import.meta.glob('../audit/fixes/*.diff', { query: '?raw', import: 'default', eager: true });
const sessionShots = import.meta.glob('../bob_sessions/*.png', { import: 'default', eager: true });

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: { darkMode: true, background: '#121212', primaryColor: '#1f2d47', primaryBorderColor: '#0F62FE', primaryTextColor: '#fff', lineColor: '#0F62FE' },
});

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => (typeof x === 'number' ? `${Math.round(x * 100)}%` : '—');

// ---------- tabs ----------
let mermaidRendered = false;
function switchTab(name) {
  document.querySelectorAll('.nav-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-pane').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'how' && !mermaidRendered) {
    mermaidRendered = true;
    mermaid.run({ nodes: document.querySelectorAll('#tab-how .mermaid') }).catch((e) => console.error('mermaid', e));
  }
}
document.querySelectorAll('.nav-tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));

// ---------- findings ----------
const findings = findingsFile.findings ?? [];
const run = findingsFile.run ?? {};
const pending = findings.length === 0;

function renderRun() {
  $('pending-banner').hidden = !pending;
  if (pending) {
    $('run-summary').textContent = run.notes || 'No audit has been run yet.';
    $('pill-score').textContent = 'pending';
    return;
  }
  const subs = run.subagents?.length ? `${run.subagents.length} subagents` : 'subagents';
  $('run-summary').textContent = `${findings.length} findings from an ${run.mode ?? 'agent'}-mode run on ${run.target ?? 'sample_app/'} using ${subs}${run.date ? `, ${new Date(run.date).toLocaleString()}` : ''}.`;
  $('pill-score').textContent = metrics.pending ? 'unscored' : `recall ${pct(metrics.recall)} · precision ${pct(metrics.precision)}`;
}

function renderSeverityCards() {
  const n = (sev) => findings.filter((f) => f.severity === sev).length;
  $('count-high').textContent = n('high');
  $('count-med').textContent = n('medium');
  $('count-low').textContent = n('low');
  $('count-fixed').textContent = findings.filter((f) => f.status === 'fixed').length;
  $('findings-count').textContent = `${findings.length} total`;
}

function renderDiff(text) {
  return text
    .split('\n')
    .map((line) => {
      let cls = '';
      if (line.startsWith('+++') || line.startsWith('---')) cls = 'line-comment';
      else if (line.startsWith('@@')) cls = 'line-comment';
      else if (line.startsWith('+')) cls = 'line-add';
      else if (line.startsWith('-')) cls = 'line-del';
      return `<span class="${cls}">${esc(line)}</span>`;
    })
    .join('\n');
}

function selectFinding(f) {
  document.querySelectorAll('.vuln-item').forEach((el) => el.classList.toggle('selected', el.dataset.id === f.id));
  $('diff-title').textContent = `${f.id} · ${f.asvs}`;
  $('diff-file').textContent = `${f.file}:${f.line}`;
  $('finding-explanation').textContent = f.explanation ?? '';
  const key = f.fix_diff ? `../${f.fix_diff}` : null;
  const diff = key && fixDiffs[key];
  if (diff) {
    $('diff-code-display').innerHTML = renderDiff(diff);
  } else {
    $('diff-code-display').innerHTML =
      `<span class="line-comment">// evidence (no fix generated yet)</span>\n<span class="line-del">${esc(f.evidence)}</span>`;
  }
}

function renderFindings() {
  const list = $('findings-list');
  if (pending) {
    list.innerHTML = '<p class="vuln-desc">Nothing to show until Bob writes audit/findings.json.</p>';
    return;
  }
  const order = { high: 0, medium: 1, low: 2 };
  const sorted = [...findings].sort((a, b) => order[a.severity] - order[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);
  list.innerHTML = sorted
    .map(
      (f) => `
      <div class="vuln-item ${f.severity === 'high' ? 'high-border' : f.severity === 'medium' ? 'med-border' : ''}" data-id="${esc(f.id)}" tabindex="0">
        <div class="vuln-header">
          <span class="badge-vuln ${f.severity === 'high' ? 'high' : f.severity === 'medium' ? 'med' : ''}">${esc(f.severity.toUpperCase())}</span>
          <strong>${esc(f.title)}</strong>
          ${f.status === 'fixed' ? '<span class="badge-status success">fixed</span>' : ''}
        </div>
        <p class="vuln-desc">${esc(f.asvs)} · <code>${esc(f.file)}:${esc(f.line)}</code></p>
      </div>`
    )
    .join('');
  list.querySelectorAll('.vuln-item').forEach((el) => {
    const f = findings.find((x) => x.id === el.dataset.id);
    el.addEventListener('click', () => selectFinding(f));
    el.addEventListener('keydown', (e) => e.key === 'Enter' && selectFinding(f));
  });
  selectFinding(sorted[0]);
}

// ---------- score ----------
function renderScore() {
  if (!metrics.pending) {
    $('m-recall').textContent = pct(metrics.recall);
    $('m-precision').textContent = pct(metrics.precision);
    $('m-caught').textContent = `${metrics.caught} / ${metrics.seeded}`;
    $('m-missed').textContent = metrics.missed;
    $('m-fp').textContent = metrics.false_positives;
  }
  const caughtIds = new Set((metrics.caught_ids ?? []).map((c) => c.defect));
  $('ground-truth-list').innerHTML = groundTruth.defects
    .map(
      (d) => `
      <div class="vuln-item ${caughtIds.has(d.id) ? 'caught' : metrics.pending ? '' : 'missed'}">
        <div class="vuln-header">
          <span class="badge-vuln ${d.severity === 'high' ? 'high' : d.severity === 'medium' ? 'med' : ''}">${esc(d.severity.toUpperCase())}</span>
          <strong>${esc(d.id)} · ${esc(d.category)}</strong>
          ${metrics.pending ? '' : caughtIds.has(d.id) ? '<span class="badge-status success">caught</span>' : '<span class="badge-status warn">missed</span>'}
        </div>
        <p class="vuln-desc">${esc(d.summary)} — <code>${esc(d.file)}:${d.line}</code></p>
      </div>`
    )
    .join('');
}

// ---------- how ----------
function renderSkills() {
  $('skill-audit-text').textContent = auditSkill;
  $('skill-fixes-text').textContent = fixesSkill;
}

// ---------- sessions ----------
function renderSessions() {
  const entries = Object.entries(sessionShots).sort(([a], [b]) => a.localeCompare(b));
  $('session-empty').hidden = entries.length > 0;
  $('session-gallery').innerHTML = entries
    .map(([path, url], i) => {
      const name = path.split('/').pop();
      return `
      <div class="session-card">
        <div class="session-card-header"><span class="task-badge">#${i + 1}</span><h4>${esc(name)}</h4></div>
        <div class="session-img-wrap"><a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${esc(name)}" loading="lazy" /></a></div>
        <div class="session-card-meta"><span><code>bob_sessions/${esc(name)}</code></span></div>
      </div>`;
    })
    .join('');
}

renderRun();
renderSeverityCards();
renderFindings();
renderScore();
renderSkills();
renderSessions();
