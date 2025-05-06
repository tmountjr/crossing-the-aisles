"use server";

import { db } from "@/db";
import { desc } from "drizzle-orm";
import { siteMetaInSiteMeta as siteMeta } from "@/db/schema";

export const lastUpdateDate = async () => {
  const data = await db.select({
    lastUpdate: siteMeta.lastUpdate
  })
  .from(siteMeta)
  .orderBy(desc(siteMeta.lastUpdate))
  .limit(1)
  .execute();

  if (data.length === 0) {
    return null;
  }
  return data[0].lastUpdate;
}
