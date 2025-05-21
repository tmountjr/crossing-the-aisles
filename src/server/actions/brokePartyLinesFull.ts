"use server";

import { cache } from "react";
import type { BrokePartyLinesFilters, BrokePartyLinesData, VoteWithPartyLine } from "@/db/queries/partylineFull";
import { brokePartyLineVotes, nominationPartyLineVoteCount, partyLineVoteCount, votesWithPartyLineByLegislator } from "@/db/queries/partylineFull";

export const fetchBplData = cache(async (filters: BrokePartyLinesFilters): Promise<BrokePartyLinesData[]> => {
  const data = await brokePartyLineVotes(filters);
  return data;
});

export const fetchVotesByLegislator = cache(async (id: string): Promise<VoteWithPartyLine[]> => {
  const data = await votesWithPartyLineByLegislator(id);
  return data;
});

export const fetchPartyLineVoteCount = cache(async (voteId: string | null) => {
  const data = await partyLineVoteCount(voteId);
  return data;
});

export const fetchNominationPartyLineVoteCount = cache(async () => {
  const data = await nominationPartyLineVoteCount();
  return data;
});
