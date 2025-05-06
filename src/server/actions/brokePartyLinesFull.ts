"use server";

import { brokePartyLineVotes, votesWithPartyLineByLegislator } from "@/db/queries/partylineFull";
import type { BrokePartyLinesFilters, BrokePartyLinesData, VoteWithPartyLine } from "@/db/queries/partylineFull";

export const fetchBplData = async (filters: BrokePartyLinesFilters): Promise<BrokePartyLinesData[]> => {
  const data = await brokePartyLineVotes(filters);
  return data;
};

export const fetchVotesByLegislator = async (id: string): Promise<VoteWithPartyLine[]> => {
  const data = await votesWithPartyLineByLegislator(id);
  return data;
};
