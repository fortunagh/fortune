import { connection } from "next/server";

/** Opt dynamic dashboard pages into request-time rendering under cacheComponents. */
export async function requireRequest() {
  await connection();
}
