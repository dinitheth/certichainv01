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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = drizzle(getPool(), { schema: { institutionRegistrations } });

    // GET all registrations
    if (event.httpMethod === 'GET') {
      const registrations = await db.select().from(institutionRegistrations);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(registrations),
      };
    }

    // POST new registration
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, email, website, location, description, walletAddress } = body;

      if (!name || !email || !website || !location || !description || !walletAddress) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'All fields are required' }),
        };
      }

      // Check if wallet already registered
      const existing = await db
        .select()
        .from(institutionRegistrations)
        .where(eq(institutionRegistrations.walletAddress, walletAddress.toLowerCase()));

      if (existing.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'This wallet address is already registered' }),
        };
      }

      const [registration] = await db
        .insert(institutionRegistrations)
        .values({
          name,
          email,
          website,
          location,
          description,
          walletAddress: walletAddress.toLowerCase(),
          status: 'pending',
        })
        .returning();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(registration),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
