import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema";
function createDatabase() {
  return drizzle({ schema });
}
let client: ReturnType<typeof createDatabase> | undefined;
// Cache only the connection client. All member state remains in Postgres.
export function database() {
  return (client ??= createDatabase());
}
