import mermaid from 'mermaid';
import './style.css';

// Initialize Mermaid.js diagram renderer
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    background: '#121212',
    primaryColor: '#1f2d47',
    primaryBorderColor: '#0F62FE',
    primaryTextColor: '#ffffff',
    lineColor: '#0F62FE'
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switcher Logic
  const tabs = document.querySelectorAll('.nav-tab');
  const panes = document.querySelectorAll('.tab-pane');
  const sessionsBtn = document.getElementById('nav-sessions-btn');

  function switchTab(targetTab) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === targetTab));
    panes.forEach(p => p.classList.toggle('active', p.id === `tab-${targetTab}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  if (sessionsBtn) {
    sessionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('sessions');
    });
  }

  // Interactive Security Audit Demo
  const btnRunAudit = document.getElementById('btn-run-audit');
  const countHigh = document.getElementById('count-high');
  const countMed = document.getElementById('count-med');
  const countLow = document.getElementById('count-low');
  const vulnContainer = document.getElementById('vuln-list-container');
  const diffCodeDisplay = document.getElementById('diff-code-display');

  if (btnRunAudit) {
    btnRunAudit.addEventListener('click', () => {
      btnRunAudit.innerText = '🔄 Scanning with Bob Security Subagent...';
      btnRunAudit.disabled = true;

      setTimeout(() => {
        btnRunAudit.innerText = '✅ Audit Complete (OWASP ASVS v4.0)';
        btnRunAudit.disabled = false;
        countHigh.innerText = '0';
        countMed.innerText = '0';
        countLow.innerText = '0';

        vulnContainer.innerHTML = `
          <div class="vuln-item" style="border-left: 4px solid var(--ibm-green); background: #1a291f;">
            <div class="vuln-header">
              <span class="badge-vuln" style="background: var(--ibm-green);">PASSED</span>
              <strong>OWASP ASVS Compliance Verified (100%)</strong>
            </div>
            <p class="vuln-desc">IBM Bob Literate Coding applied parameterized SQL query bindings and strong password regex enforcement across all endpoints.</p>
          </div>
        `;

        diffCodeDisplay.innerHTML = `
<span class="line-comment">// @bob literate refactoring status: ALL SECURITY FLAWS RESOLVED</span>
<span class="line-add">+ const query = "SELECT * FROM users WHERE email = $1";</span>
<span class="line-add">+ const result = await db.query(query, [req.body.email]);</span>
<span class="line-add">+ const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$/;</span>
`;
      }, 1200);
    });
  }

  // Fix Buttons Event Handling
  document.querySelectorAll('.btn-fix').forEach(btn => {
    btn.addEventListener('click', () => {
      const fixType = btn.dataset.fix;
      if (fixType === 'sql') {
        diffCodeDisplay.innerHTML = `
<span class="line-comment">// @bob refactor: sanitize SQL query using parameterized statements</span>
<span class="line-del">- const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'";</span>
<span class="line-add">+ const query = "SELECT * FROM users WHERE email = $1";</span>
<span class="line-add">+ const result = await db.query(query, [req.body.email]);</span>
`;
        btn.innerText = '✅ Fixed';
        btn.disabled = true;
      } else if (fixType === 'password') {
        diffCodeDisplay.innerHTML = `
<span class="line-comment">// @bob refactor: enforce OWASP V2.1.1 password complexity</span>
<span class="line-del">- const isStrong = req.body.password.length > 6;</span>
<span class="line-add">+ const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$/.test(req.body.password);</span>
`;
        btn.innerText = '✅ Fixed';
        btn.disabled = true;
      }
    });
  });

  // Re-run /init Notification
  const btnInit = document.getElementById('btn-run-init');
  if (btnInit) {
    btnInit.addEventListener('click', () => {
      btnInit.innerText = '⚡ /init Executed';
      setTimeout(() => { btnInit.innerText = '⚡ Re-run /init Command'; }, 2000);
    });
  }

  // SARIF / OSCAL Export Handlers
  const btnSarif = document.getElementById('btn-export-sarif');
  const btnOscal = document.getElementById('btn-export-oscal');

  if (btnSarif) {
    btnSarif.addEventListener('click', () => {
      const sarifData = {
        $schema: "https://json.schemastore.org/sarif-2.1.0.json",
        version: "2.1.0",
        runs: [{
          tool: { driver: { name: "IBM Bob Security Auditor", version: "2.0.2" } },
          results: [{ ruleId: "OWASP-ASVS-5.3.1", message: { text: "Sanitized SQL query via parameterized binding." }, level: "none" }]
        }]
      };
      const blob = new Blob([JSON.stringify(sarifData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devpulse_security_audit_sarif.json';
      a.click();
    });
  }

  if (btnOscal) {
    btnOscal.addEventListener('click', () => {
      alert('OSCAL Compliance Report Exported: devpulse_oscal_report.json');
    });
  }

  // Commit Generator Simulation
  const btnCommit = document.getElementById('btn-generate-commit');
  const commitText = document.getElementById('commit-msg-text');
  if (btnCommit && commitText) {
    btnCommit.addEventListener('click', () => {
      commitText.innerHTML = `<code>fix(security): resolve OWASP ASVS vulnerabilities & update test coverage (#104)</code>`;
    });
  }
});
