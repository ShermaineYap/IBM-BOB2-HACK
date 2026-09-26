#!/usr/bin/env node
/**
 * Score audit/findings.json against audit/ground_truth.json.
 * Writes audit/metrics.json and prints a table.
 *
 *   node scripts/score_audit.mjs
 *
 * A finding matches a seeded defect when the file and category are equal and
 * the line numbers are within 3 of each other. Each defect can be matched once.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gt = JSON.parse(readFileSync(resolve(root, 'audit/ground_truth.json'), 'utf8'));
const audit = JSON.parse(readFileSync(resolve(root, 'audit/findings.json'), 'utf8'));

const LINE_TOLERANCE = 3;
const defects = gt.defects.map((d) => ({ ...d, matched_by: null }));
const findings = audit.findings.map((f) => ({ ...f, matches: null }));

for (const f of findings) {
  const d = defects.find(
    (d) =>
      !d.matched_by &&
      d.file === f.file &&
      d.category === f.category &&
      Math.abs(d.line - f.line) <= LINE_TOLERANCE
  );
  if (d) {
    d.matched_by = f.id;
    f.matches = d.id;
  }
}

const caught = defects.filter((d) => d.matched_by);
const missed = defects.filter((d) => !d.matched_by);
const falsePositives = findings.filter((f) => !f.matches);
const fixed = findings.filter((f) => f.status === 'fixed');

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
  pending: findings.length === 0,
  seeded: defects.length,
  reported: findings.length,
  caught: caught.length,
  missed: missed.length,
  false_positives: falsePositives.length,
  fixed: fixed.length,
  precision: Number(precision.toFixed(3)),
  recall: Number(recall.toFixed(3)),
  by_severity: bySeverity,
  caught_ids: caught.map((d) => ({ defect: d.id, finding: d.matched_by })),
  missed_ids: missed.map((d) => d.id),
  false_positive_ids: falsePositives.map((f) => f.id),
};

writeFileSync(resolve(root, 'audit/metrics.json'), JSON.stringify(metrics, null, 2) + '\n');

const pct = (x) => `${Math.round(x * 100)}%`;
console.log(`\nDevPulse audit score`);
console.log(`  seeded defects : ${metrics.seeded}`);
console.log(`  reported       : ${metrics.reported}`);
console.log(`  caught         : ${metrics.caught}  (recall ${pct(recall)})`);
console.log(`  false positives: ${metrics.false_positives}  (precision ${pct(precision)})`);
console.log(`  fixed          : ${metrics.fixed}`);
if (missed.length) console.log(`  missed         : ${missed.map((d) => `${d.id} ${d.category}`).join(', ')}`);
if (falsePositives.length) console.log(`  false positives: ${falsePositives.map((f) => `${f.id} ${f.title}`).join(', ')}`);
console.log(`\nwrote audit/metrics.json\n`);
