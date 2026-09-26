#!/usr/bin/env node
/**
 * Score an audit run against its answer key.
 *
 *   node scripts/score_audit.mjs            # round 1: audit/  (sample_app/)
 *   node scripts/score_audit.mjs audit/hard # round 2: audit/hard/ (ledger_app/)
 *
 * Reads <dir>/findings.json and <dir>/ground_truth.json, writes <dir>/metrics.json.
 * A finding matches a seeded defect when the category is equal and the file/line
 * is within 3 lines of any of the defect's locations. Each defect matches once.
 * Every fix diff is also checked with `git apply --check`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2] || 'audit';
const read = (p) => JSON.parse(readFileSync(resolve(root, dir, p), 'utf8'));
const gt = read('ground_truth.json');
const audit = existsSync(resolve(root, dir, 'findings.json')) ? read('findings.json') : { findings: [] };

const LINE_TOLERANCE = 3;
const locs = (d) => d.locations ?? [{ file: d.file, line: d.line }];
const defects = gt.defects.map((d) => ({ ...d, matched_by: null }));
const findings = audit.findings.map((f) => ({ ...f, matches: null }));

for (const f of findings) {
  const d = defects.find(
    (d) =>
      !d.matched_by &&
      d.category === f.category &&
      locs(d).some((l) => l.file === f.file && Math.abs(l.line - f.line) <= LINE_TOLERANCE)
  );
  if (d) {
    d.matched_by = f.id;
    f.matches = d.id;
  }
}

const caught = defects.filter((d) => d.matched_by);
const missed = defects.filter((d) => !d.matched_by);
const falsePositives = findings.filter((f) => !f.matches);
const decoyHits = falsePositives
  .map((f) => ({ f, d: (gt.decoys ?? []).find((d) => d.file === f.file && d.looks_like === f.category) }))
  .filter((x) => x.d)
  .map((x) => ({ finding: x.f.id, decoy: x.d.id }));
const fixed = findings.filter((f) => f.status === 'fixed');

const applies = {};
for (const f of findings) {
  if (!f.fix_diff) continue;
  if (!existsSync(resolve(root, f.fix_diff))) { applies[f.id] = 'missing'; continue; }
  const r = spawnSync('git', ['apply', '--check', f.fix_diff], { cwd: root, encoding: 'utf8' });
  applies[f.id] = r.status === 0 ? 'clean' : 'fails';
}
const fixesApply = Object.values(applies).filter((v) => v === 'clean').length;

const precision = findings.length ? caught.length / findings.length : 0;
const recall = defects.length ? caught.length / defects.length : 0;
const bySeverity = {};
for (const d of defects) {
  bySeverity[d.severity] ??= { seeded: 0, caught: 0 };
  bySeverity[d.severity].seeded += 1;
  if (d.matched_by) bySeverity[d.severity].caught += 1;
}

const metrics = {
  scored_at: new Date().toISOString(),
  target: gt.target ?? 'sample_app/',
  pending: findings.length === 0,
  seeded: defects.length,
  decoys: (gt.decoys ?? []).length,
  reported: findings.length,
  caught: caught.length,
  missed: missed.length,
  false_positives: falsePositives.length,
  decoy_hits: decoyHits.length,
  fixed: fixed.length,
  fixes_apply_cleanly: fixesApply,
  fix_apply_status: applies,
  precision: Number(precision.toFixed(3)),
  recall: Number(recall.toFixed(3)),
  by_severity: bySeverity,
  caught_ids: caught.map((d) => ({ defect: d.id, finding: d.matched_by })),
  missed_ids: missed.map((d) => d.id),
  false_positive_ids: falsePositives.map((f) => f.id),
  decoy_hit_ids: decoyHits,
};
writeFileSync(resolve(root, dir, 'metrics.json'), JSON.stringify(metrics, null, 2) + '\n');

const pct = (x) => `${Math.round(x * 100)}%`;
console.log(`\nDevPulse audit score: ${dir} (${metrics.target})`);
console.log(`  seeded defects : ${metrics.seeded}   decoys: ${metrics.decoys}`);
console.log(`  reported       : ${metrics.reported}`);
console.log(`  caught         : ${metrics.caught}  (recall ${pct(recall)})`);
console.log(`  false positives: ${metrics.false_positives}  (precision ${pct(precision)}; ${decoyHits.length} on decoys)`);
console.log(`  fixed          : ${metrics.fixed}  (${fixesApply} diffs apply cleanly with git apply --check)`);
if (missed.length) console.log(`  missed         : ${missed.map((d) => `${d.id} ${d.category}`).join(', ')}`);
if (falsePositives.length) console.log(`  false positives: ${falsePositives.map((f) => `${f.id} ${f.category} ${f.file}:${f.line}`).join('; ')}`);
console.log(`\nwrote ${dir}/metrics.json\n`);
