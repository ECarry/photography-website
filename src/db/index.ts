import * as users from "./schema/users";
import * as photos from "./schema/photos";
import * as posts from "./schema/posts";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const schema = {
  ...users,
  ...photos,
  ...posts,
};

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
