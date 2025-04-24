"use server";

import { brokePartyLineVotes, votesWithPartyLineByLegislator } from "@/db/queries/partyline";
import type { BrokePartyLinesFilters, BrokePartyLinesData, VoteWithPartyLine } from "@/db/queries/partyline";

export async function fetchBplData(filters: BrokePartyLinesFilters): Promise<BrokePartyLinesData[]> {
  const data = await brokePartyLineVotes(filters);
  return data;
}

export async function fetchVotesByLegislator(id: string): Promise<VoteWithPartyLine[]> {
  const data = await votesWithPartyLineByLegislator(id);
  return data;
}