import { db } from "@/db";
import { desc } from "drizzle-orm";
import { siteMetaInSiteMeta as siteMeta } from "@/db/schema";

const _latestUpdate = db
  .select()
  .from(siteMeta)
  .orderBy(desc(siteMeta.lastUpdate))
  .limit(1)
  .as("latest_update");

export const latestUpdate = () => db
  .select()
  .from(_latestUpdate)
  .execute();
