import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { institutionRegistrations } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const { Pool } = pg;

let pool: pg.Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = drizzle(getPool(), { schema: { institutionRegistrations } });

    // Extract wallet address from path
    const pathParts = event.path.split('/');
    const walletAddress = pathParts[pathParts.length - 1];
    
    if (!walletAddress || walletAddress === 'registrations-check') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Wallet address required' }),
      };
    }

    const [registration] = await db
      .select()
      .from(institutionRegistrations)
      .where(eq(institutionRegistrations.walletAddress, walletAddress.toLowerCase()))
      .limit(1);

    if (!registration) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'not_found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(registration),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to check registration' }),
    };
  }
};
