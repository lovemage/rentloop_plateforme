import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    // 避免在 build time 報錯，但 runtime 必須要有
    if (process.env.NODE_ENV === 'production') {
        console.warn('DATABASE_URL is not defined');
    }
}

// Disable prefetch as it is not supported for "Transaction" pool mode
// Using non-null assertion or empty string fallback to satisfy type but it will throw runtime error if missing
const client = postgres(connectionString || '', { prepare: false });
export const db = drizzle(client, { schema });
