"use server";

import { brokePartyLineVotes, votesWithPartyLineByLegislator } from "@/db/queries/partylineFull";
import type { BrokePartyLinesFilters, BrokePartyLinesData, VoteWithPartyLine } from "@/db/queries/partylineFull";

export const fetchBplData = async (filters: BrokePartyLinesFilters): Promise<BrokePartyLinesData[]> => {
  const data = await brokePartyLineVotes(filters);
  data.sort((a, b) => {
    const aPercent = a.brokePartyLineCount / a.totalVoteCount;
    const bPercent = b.brokePartyLineCount / b.totalVoteCount;
    if (aPercent < bPercent) {
      return 1;
    } else if (aPercent > bPercent) {
      return -1;
    } else {
      if (a.brokePartyLineCount < b.brokePartyLineCount) {
        return 1;
      } else if (a.brokePartyLineCount > b.brokePartyLineCount) {
        return -1;
      } else {
        return 0
      }
    }
  });
  return data;
};

export const fetchVotesByLegislator = async (id: string): Promise<VoteWithPartyLine[]> => {
  const data = await votesWithPartyLineByLegislator(id);
  return data;
};
