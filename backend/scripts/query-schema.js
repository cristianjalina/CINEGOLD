import { queryDatabase } from '../src/db/request.js';

try {
  const result = await queryDatabase(`
    SELECT
      TABLE_NAME AS tableName,
      COLUMN_NAME AS columnName,
      DATA_TYPE AS dataType,
      IS_NULLABLE AS isNullable
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_CATALOG = DB_NAME()
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);

  console.log(JSON.stringify(result.recordset, null, 2));
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
