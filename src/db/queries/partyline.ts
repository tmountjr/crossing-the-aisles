import { db } from "@/db";
import { AllowedChambers, AllowedParties } from "@/db/types";
import { and, asc, count, desc, eq, inArray, InferSelectModel, sql } from "drizzle-orm";
import {
  votes as v,
  legislators as l,
  enrichedVoteMeta as vm,
  latestVoteIds as v_ids,
} from "@/db/schema";

const _tempVoteMeta = db
  .select({
    voteNumber: v_ids.voteNumber,
    voteId: v_ids.voteId,
    billId: v_ids.billId,
    chamber: v_ids.chamber,
    date: v_ids.date,
    result: v_ids.result,
    category: v_ids.category,
    nomination_title: v_ids.nominationTitle,
    sourceFilename: v_ids.sourceFilename,
    sponsorName: vm.sponsorName,
    sponsorParty: sql<string>`
     CASE
        WHEN ${v_ids.category} = 'nomination'
        THEN 'R'
        ELSE ${vm.sponsorParty}
      END`.as("sponsor_party"),
  })
  .from(vm)
  .innerJoin(v_ids, eq(vm.voteId, v_ids.voteId))
  .as('temp_vote_meta');

export const _votesWithPartyLine = db
  .select({
    voteId: v.voteId,
    legislatorId: v.legislatorId,
    position: v.position,
    category: _tempVoteMeta.category,
    nominationTitle: _tempVoteMeta.nomination_title,
    sponsor_party: _tempVoteMeta.sponsorParty,
    name: l.name,
    state: l.state,
    district: l.district,
    termType: l.termType,
    party: l.party,
    caucus: l.caucus,
    isPartyLine: sql<boolean>`
      CASE
        WHEN (${l.caucus} =  ${_tempVoteMeta.sponsorParty} AND ${v.position} != 'Nay')
          OR (${l.caucus} != ${_tempVoteMeta.sponsorParty} AND ${v.position} != 'Yea')
        THEN 1
        ELSE 0
      END`.as("is_party_line"),
    isAbstain: sql<boolean>`
      CASE WHEN ${v.position} NOT IN ('Yea', 'Nay') THEN 1 ELSE 0 END
    `.as('is_abstain')
  })
  .from(v)
  .innerJoin(_tempVoteMeta, eq(v.voteId, _tempVoteMeta.voteId))
  .innerJoin(l, eq(v.legislatorId, l.id))
  .as("votes_with_party_line");

const _brokePartyLineVotes = db
  .select({
    legislatorId: _votesWithPartyLine.legislatorId,
    name: _votesWithPartyLine.name,
    state: _votesWithPartyLine.state,
    district: _votesWithPartyLine.district,
    termType: _votesWithPartyLine.termType,
    party: _votesWithPartyLine.party,
    caucus: _votesWithPartyLine.caucus,
    brokePartyLineCount: sql<number>`
      SUM(
        CASE
          WHEN ${_votesWithPartyLine.isPartyLine} = 0
          THEN 1
          ELSE 0
        END
      )`.as('broke_party_line_count'),
    totalVoteCount: count(_votesWithPartyLine.legislatorId).as("total_vote_count"),
  })
  .from(_votesWithPartyLine)
  .groupBy((t) => [
    t.legislatorId,
    t.name,
    t.state,
    t.district,
    t.termType,
    t.party,
    t.caucus,
  ])
  .as('broke_party_line_votes');

export interface BrokePartyLinesFilters {
  state?: string;
  chamber?: AllowedChambers;
  party?: AllowedParties;
  legislatorIds?: string[];
};

/**
 * Get the Broke Party Lines data, optionally limited by a set of filters.
 * @param param0.state Limit results by state.
 * @param param0.chamber Limit results by chamber. Use "sen" or "rep" for Senate or House.
 * @param param0.party Limit results by legislator party. Use "d", "r", or "i".
 * @param param0.legislatorIds Limit results by one or more legislator IDs.
 * @returns The Broke Party Lines summaries for the given filters.
 */
export const brokePartyLineVotes = ({
  state, chamber, party, legislatorIds
}: BrokePartyLinesFilters) => {
  const normalizedChamber = chamber === "all" ? undefined : chamber;
  const normalizedParty = party === "all" ? undefined : party;
  
  return db
    .select()
    .from(_brokePartyLineVotes)
    .where(
      and(
        state ? eq(_brokePartyLineVotes.state, state) : undefined,
        normalizedChamber ? eq(_brokePartyLineVotes.termType, normalizedChamber) : undefined,
        normalizedParty ? eq(_brokePartyLineVotes.party, normalizedParty) : undefined,
        legislatorIds ? inArray(_brokePartyLineVotes, legislatorIds) : undefined
      )
    )
    .orderBy(desc(_brokePartyLineVotes.brokePartyLineCount))
    .execute();
}

export type BrokePartyLinesData =
  Pick<InferSelectModel<typeof v>, "legislatorId"> &
  Pick<InferSelectModel<typeof l>, "name" | "state" | "district" | "termType" | "party" | "caucus"> &
  {
    brokePartyLineCount: number,
    totalVoteCount: number
  };

export const votesWithPartyLineByLegislator = (id: string): Promise<VoteWithPartyLine[]> => db
  .select()
  .from(_votesWithPartyLine)
  .where(eq(_votesWithPartyLine.legislatorId, id))
  .orderBy(asc(_votesWithPartyLine.voteId))
  .execute();

export type VoteWithPartyLine =
  Pick<InferSelectModel<typeof v>, "voteId" | "legislatorId" | "position"> &
  Pick<InferSelectModel<typeof l>, "name" | "state" | "district" | "termType" | "party" | "caucus"> &
  {
    category: string | null,
    nominationTitle: string | null,
    sponsor_party: string,
    isPartyLine: boolean,
    isAbstain: boolean
  };