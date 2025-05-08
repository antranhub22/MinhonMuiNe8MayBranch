import { sql } from 'drizzle-orm';
import { staff, request, message } from '../schema';

export async function up(db) {
  await db.schema.createTable(staff);
  await db.schema.createTable(request);
  await db.schema.createTable(message);
}

export async function down(db) {
  await db.schema.dropTable(message);
  await db.schema.dropTable(request);
  await db.schema.dropTable(staff);
} 