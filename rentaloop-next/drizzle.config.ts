import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load .env.local if it exists
config({ path: '.env.local' });

export default defineConfig({
    out: './drizzle',
    schema: './src/lib/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
