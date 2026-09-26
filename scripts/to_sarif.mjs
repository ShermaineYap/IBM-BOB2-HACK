#!/usr/bin/env node
/**
 * Convert <dir>/findings.json into SARIF 2.1.0 at <dir>/findings.sarif,
 * ready for GitHub code scanning (`github/codeql-action/upload-sarif`).
 *
 *   node scripts/to_sarif.mjs            # audit/
 *   node scripts/to_sarif.mjs audit/hard
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2] || 'audit';
const { run = {}, findings = [] } = JSON.parse(readFileSync(resolve(root, dir, 'findings.json'), 'utf8'));
const plain = (s) => String(s ?? '').replace(/\s*[\u2014\u2013]\s*/g, ', ');
const LEVEL = { high: 'error', medium: 'warning', low: 'note' };
const SCORE = { high: '8.0', medium: '5.0', low: '2.0' };

const rules = [...new Map(findings.map((f) => [f.category, f])).values()].map((f) => ({
  id: f.category,
  name: f.category.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase()),
  shortDescription: { text: `${f.category} (OWASP ASVS ${f.asvs})` },
  helpUri: 'https://owasp.org/www-project-application-security-verification-standard/',
  properties: { tags: ['security', `asvs-${f.asvs}`] },
}));

const sarif = {
  $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
  version: '2.1.0',
  runs: [
    {
      tool: {
        driver: {
          name: 'DevPulse (IBM Bob 2.0 security-audit skill)',
          informationUri: 'https://github.com/ShermaineYap/IBM-BOB2-HACK',
          rules,
        },
      },
      invocations: [{ executionSuccessful: true, endTimeUtc: run.date || undefined }],
      results: findings.map((f) => ({
        ruleId: f.category,
        level: LEVEL[f.severity] ?? 'warning',
        message: { text: plain(`${f.title}. ${f.explanation}`) },
        locations: [{ physicalLocation: { artifactLocation: { uri: f.file }, region: { startLine: f.line, snippet: { text: f.evidence } } } }],
        partialFingerprints: { devpulseId: `${dir}:${f.id}` },
        properties: { 'security-severity': SCORE[f.severity], asvs: f.asvs, status: f.status ?? 'open', fixDiff: f.fix_diff },
      })),
    },
  ],
};
writeFileSync(resolve(root, dir, 'findings.sarif'), JSON.stringify(sarif, null, 2) + '\n');
console.log(`wrote ${dir}/findings.sarif (${findings.length} results, ${rules.length} rules)`);
