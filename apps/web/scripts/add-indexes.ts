// Script to add database indexes for performance
// Can be run on any platform (Windows, Mac, Linux)

import { prisma } from '@/lib/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('Adding database indexes...');

  const sqlPath = join(process.cwd(), 'prisma', 'migrations', 'add_indexes.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  try {
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
      }
    }

    console.log('✅ Indexes added successfully!');
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
