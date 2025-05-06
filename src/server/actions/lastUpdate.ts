"use server";

import { latestUpdate } from "@/db/queries/siteMeta";

export const lastUpdateDate = async () => {
  const data = await latestUpdate();

  if (data.length === 0) {
    return null;
  }

  const { lastUpdate, tz } = data[0];
  const naiveDate = new Date(lastUpdate);
  const formatter = new Intl.DateTimeFormat("default", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formatter.format(naiveDate);
}
