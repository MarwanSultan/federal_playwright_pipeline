const { readFileSync } = require('node:fs');

const file = require('node:path').join(__dirname, '..', 'traceability', 'security-controls.json');
const data = JSON.parse(readFileSync(file, 'utf8'));
const statuses = new Set([
  'implemented',
  'partially implemented',
  'not applicable',
  'organizational/process control',
  'infrastructure control',
  'independent assessment required',
]);
const required = [
  'id',
  'controlFamily',
  'objective',
  'requirement',
  'testId',
  'automation',
  'ciStage',
  'evidence',
  'status',
];
const ids = new Set();

if (!Array.isArray(data)) throw new Error('Traceability document must be an array');
for (const entry of data) {
  for (const field of required)
    if (!entry[field]) throw new Error(`${field} is required for ${entry.id ?? 'unknown'}`);
  if (ids.has(entry.id)) throw new Error(`Duplicate traceability ID: ${entry.id}`);
  if (!statuses.has(entry.status))
    throw new Error(`Invalid status for ${entry.id}: ${entry.status}`);
  ids.add(entry.id);
}
console.log(`Validated ${data.length} traceability records.`);
