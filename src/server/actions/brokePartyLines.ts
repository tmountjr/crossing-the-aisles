"use server";

import { brokePartyLineVotes } from "@/db/queries/partyline";
import type { BrokePartyLinesFilters, BrokePartyLinesData } from "@/db/queries/partyline";

export async function fetchBplData(filters: BrokePartyLinesFilters): Promise<BrokePartyLinesData[]> {
  const data = await brokePartyLineVotes(filters);
  return data;
}