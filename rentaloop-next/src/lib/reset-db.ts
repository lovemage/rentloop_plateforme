import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
    const { db } = await import('./db');
    console.log('🗑️ Dropping schema public...');
    // Force drop public schema and recreate it
    await db.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    // Grant permissions back if needed (usually default user has it)
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

    console.log('✅ DB Reset complete.');
    process.exit(0);
}

main().catch(console.error);
