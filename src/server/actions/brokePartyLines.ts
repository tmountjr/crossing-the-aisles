"use server";

import { cache } from "react";
import { brokePartyLineVotes, votesWithPartyLineByLegislator } from "@/db/queries/partyline";
import type { BrokePartyLinesFilters, BrokePartyLinesData, VoteWithPartyLine } from "@/db/queries/partyline";

export const fetchBplData = cache(async (filters: BrokePartyLinesFilters): Promise<BrokePartyLinesData[]> => {
  const data = await brokePartyLineVotes(filters);
  return data;
});

export const fetchVotesByLegislator = cache(async (id: string): Promise<VoteWithPartyLine[]> => {
  const data = await votesWithPartyLineByLegislator(id);
  return data;
});
