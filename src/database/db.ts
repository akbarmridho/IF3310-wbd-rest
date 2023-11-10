import {drizzle} from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import postgres from 'postgres';

const databaseUrl = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
export const postgresClient = postgres(databaseUrl);

export const db = drizzle(postgresClient, {schema});
