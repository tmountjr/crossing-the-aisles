import { db } from "@/db";
import { AllowedChambers, AllowedParties } from "@/db/types";
import { and, asc, count, desc, eq, inArray, InferSelectModel, sql } from "drizzle-orm";
import {
  votes as v,
  legislators as l,
  enrichedVoteMeta as vm,
} from "@/db/schema";

const _votesWithPartyLine = db
  .select({
    voteId: v.voteId,
    legislatorId: v.legislatorId,
    position: v.position,
    originalPosition: v.originalPosition,
    category: vm.category,
    nominationTitle: vm.nominationTitle,
    sponsorParty: vm.sponsorParty,
    date: vm.date,
    name: l.name,
    state: l.state,
    district: l.district,
    termType: l.termType,
    party: l.party,
    caucus: l.caucus,
    isPartyLine: sql<boolean>`
      CASE
        WHEN ((${l.caucus} =  ${vm.sponsorParty} AND ${v.position} != 'Nay')
          OR (${l.caucus} != ${vm.sponsorParty} AND ${v.position} != 'Yea'))
        THEN true
        ELSE false
      END`.as("is_party_line"),
    isAbstain: sql<boolean>`
      CASE
        WHEN ${v.position} NOT IN ('Yea', 'Nay')
        THEN true
        ELSE false
      END`.as("is_abstain")
  })
  .from(v)
  .innerJoin(vm, eq(v.voteId, vm.voteId))
  .innerJoin(l, eq(v.legislatorId, l.id))
  .as("votes_with_party_line");

const _brokePartyLineVotesPre = db
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
          WHEN ${_votesWithPartyLine.isPartyLine} = 't'
          THEN 0
          ELSE 1
        END
      )`.as("broke_party_line_count"),
    totalVoteCount: count(_votesWithPartyLine.legislatorId).as("total_vote_count")
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
  .as("broke_party_line_votes_pre");

const _brokePartyLineVotes = db
  .select({
    legislatorId: _brokePartyLineVotesPre.legislatorId,
    name: _brokePartyLineVotesPre.name,
    state: _brokePartyLineVotesPre.state,
    district: _brokePartyLineVotesPre.district,
    termType: _brokePartyLineVotesPre.termType,
    party: _brokePartyLineVotesPre.party,
    caucus: _brokePartyLineVotesPre.caucus,
    brokePartyLineCount: _brokePartyLineVotesPre.brokePartyLineCount,
    totalVoteCount: _brokePartyLineVotesPre.totalVoteCount,
    brokePartyLinePercent: sql<number>`CAST(${_brokePartyLineVotesPre.brokePartyLineCount} AS FLOAT) / CAST(${_brokePartyLineVotesPre.totalVoteCount} AS FLOAT)`.as("broke_party_line_percent"),
  })
  .from(_brokePartyLineVotesPre)
  .as("broke_party_line_votes");

export const _votesGroupedByPartywithPartyLine = db
  .select({
    voteId: _votesWithPartyLine.voteId,
    demPartyLineCount: sql<number>`count(*) filter (where ${_votesWithPartyLine.caucus} = 'D' and ${_votesWithPartyLine.isPartyLine})`.as("dem_party_line_count"),
    demNotPartyLineCount: sql<number>`count(*) filter (where ${_votesWithPartyLine.caucus} = 'D' and not ${_votesWithPartyLine.isPartyLine})`.as("dem_not_party_line_count"),
    repNotPartyLineCount: sql<number>`count(*) filter (where ${_votesWithPartyLine.caucus} = 'R' and not ${_votesWithPartyLine.isPartyLine})`.as("rep_not_party_line_count"),
    repPartyLineCount: sql<number>`count(*) filter (where ${_votesWithPartyLine.caucus} = 'R' and ${_votesWithPartyLine.isPartyLine})`.as("rep_party_line_count"),
  })
  .from(_votesWithPartyLine)
  .groupBy(_votesWithPartyLine.voteId)
  .as("votes_grouped_by_party_with_party_line");

export interface BrokePartyLinesFilters {
  state?: string;
  chamber?: AllowedChambers;
  party?: AllowedParties;
  legislatorIds?: string[];
  sortOrder?: string;
}

/**
 * Get the Broke Party Lines data, optionally limited by a set of filters.
 * @param param0.state Limit results by state.
 * @param param0.chamber Limit results by chamber. Use "sen" or "rep" for Senate or House.
 * @param param0.party Limit results by legislator party. Use "d", "r", or "i".
 * @param param0.legislatorIds Limit results by one or more legislator IDs.
 * @returns The Broke Party Lines summaries for the given filters.
 */
export const brokePartyLineVotes = ({
  state, chamber, party, legislatorIds, sortOrder = "desc"
}: BrokePartyLinesFilters) => {
  const normalizedChamber = chamber === "all" ? undefined : chamber;
  const normalizedParty = party === "all" ? undefined : party;

  let sorter = desc;
  if (sortOrder === "asc") {
    sorter = asc;
  }

  return db
    .select()
    .from(_brokePartyLineVotes)
    .where(
      and(
        state ? eq(_brokePartyLineVotes.state, state) : undefined,
        normalizedChamber ? eq(_brokePartyLineVotes.termType, normalizedChamber) : undefined,
        normalizedParty ? eq(_brokePartyLineVotes.party, normalizedParty) : undefined,
        legislatorIds && legislatorIds.length > 0 ? inArray(_brokePartyLineVotes, legislatorIds) : undefined
      )
    )
    .orderBy(sorter(_brokePartyLineVotes.brokePartyLinePercent))
    .execute();
}

export type BrokePartyLinesData =
  Pick<InferSelectModel<typeof v>, "legislatorId"> &
  Pick<InferSelectModel<typeof l>, "name" | "state" | "district" | "termType" | "party" | "caucus"> &
  {
    brokePartyLineCount: number,
    totalVoteCount: number,
    brokePartyLinePercent: number
  };

export type VoteWithPartyLine =
  Pick<InferSelectModel<typeof v>, "voteId" | "legislatorId" | "position"> &
  Pick<InferSelectModel<typeof l>, "name" | "state" | "district" | "termType" | "party" | "caucus"> &
  {
    date: string | null,
    category: string | null,
    nominationTitle: string | null,
    sponsorParty: string | null,
    isPartyLine: boolean,
    isAbstain: boolean
  };

export const votesWithPartyLineByLegislator = async (id: string): Promise<VoteWithPartyLine[]> => db
  .select()
  .from(_votesWithPartyLine)
  .where(eq(_votesWithPartyLine.legislatorId, id))
  .orderBy(desc(_votesWithPartyLine.date))
  .execute();

export const partyLineVoteCount = async (voteId: string | null) => db
  .select()
  .from(_votesGroupedByPartywithPartyLine)
  .where(
    voteId ? eq(_votesGroupedByPartywithPartyLine.voteId, voteId) : undefined
  )
  .execute();

export const nominationPartyLineVoteCount = async () => db
  .select()
  .from(_votesGroupedByPartywithPartyLine)
  .innerJoin(vm, eq(_votesGroupedByPartywithPartyLine.voteId, vm.voteId))
  .where(eq(vm.category, "nomination"))
  .orderBy(desc(vm.date))
  .execute();

export type nomPLV = Awaited<ReturnType<typeof nominationPartyLineVoteCount>>;