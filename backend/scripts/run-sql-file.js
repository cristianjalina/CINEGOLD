import fs from 'node:fs';
import path from 'node:path';
import { queryDatabase } from '../src/db/request.js';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Uso: node scripts/run-sql-file.js <archivo.sql>');
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), filePath);
const sqlText = fs.readFileSync(absolutePath, 'utf8');
const batches = sqlText
  .split(/^\s*GO\s*;?\s*$/gim)
  .map((batch) => batch.trim())
  .filter(Boolean);

try {
  for (const [index, batch] of batches.entries()) {
    const result = await queryDatabase(batch);
    console.log(`Batch ${index + 1}/${batches.length} ejecutado`);
    if (result.recordset?.length) {
      console.log(JSON.stringify(result.recordset, null, 2));
    }
  }
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
