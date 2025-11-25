import * as schema from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";

const isLocal = process.env.DATABASE_PROVIDER === "local";

// Use 'pg' for local/docker development and 'neon-http' for serverless/production
export const db = isLocal
  ? drizzlePg(new pg.Pool({ connectionString: process.env.DATABASE_URL! }), {
      schema,
    })
  : drizzleNeon(neon(process.env.DATABASE_URL!), { schema });
