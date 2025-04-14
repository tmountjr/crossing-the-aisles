import { db } from "@/db";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import {
  bills as b,
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
    sponsorParty: sql<string>`
     CASE
        WHEN ${v_ids.category} = 'nomination'
        THEN 'R'
        ELSE ${vm.sponsorParty}
      END`.as("sponsor_party"),
  })
  .from(v_ids)
  .innerJoin(vm, eq(v_ids.voteId, vm.voteId))
  .leftJoin(b, eq(v_ids.billId, b.billId))
  .as('temp_vote_meta');

const _votesWithPartyLine = db
  .select({
    voteId: v.voteId,
    legislatorId: v.legislatorId,
    position: v.position,
    sponsor_party: _tempVoteMeta.sponsorParty,
    name: l.name,
    state: l.state,
    district: l.district,
    termType: l.termType,
    party: l.party,
    isPartyLine: sql<boolean>`
      CASE
        WHEN (${l.party} =  ${_tempVoteMeta.sponsorParty} AND ${v.position} != 'Nay') 
          OR (${l.party} != ${_tempVoteMeta.sponsorParty} AND ${v.position} != 'Yea')
        THEN TRUE
        ELSE FALSE
      END`.as("is_party_line")
  })
  .from(v)
  .innerJoin(_tempVoteMeta, eq(v.voteId, _tempVoteMeta.voteId))
  .innerJoin(l, eq(v.legislatorId, l.id))
  .as("votes_with_party_line")

const _brokePartyLineVotes = db
  .select({
    legislatorId: _votesWithPartyLine.legislatorId,
    name: _votesWithPartyLine.name,
    state: _votesWithPartyLine.state,
    district: _votesWithPartyLine.district,
    termType: _votesWithPartyLine.termType,
    party: _votesWithPartyLine.party,
    brokePartyLineCount: sql<number>`
      CASE
        WHEN ${_votesWithPartyLine.isPartyLine} = 0
        THEN 1
        ELSE 0
      END`.as('broke_party_line_count'),
    totalVoteCount: count(_votesWithPartyLine.legislatorId).as("total_vote_count"),
  })
  .from(_votesWithPartyLine)
  .groupBy(_votesWithPartyLine.legislatorId)
  .as('broke_party_line_votes');

interface BrokePartyLinesFilters {
  state?: string;
  chamber?: "sen" | "rep";
  party?: "d" | "r" | "i";
  legislatorIds?: string[];
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
  state, chamber, party, legislatorIds
}: BrokePartyLinesFilters) => db
  .select()
  .from(_brokePartyLineVotes)
  .where(
    and(
      state ? eq(_brokePartyLineVotes.state, state) : undefined,
      chamber ? eq(_brokePartyLineVotes.termType, chamber) : undefined,
      party ? eq(_brokePartyLineVotes.party, party.toUpperCase()) : undefined,
      legislatorIds ? inArray(_brokePartyLineVotes, legislatorIds) : undefined
    )
  )
  .orderBy(asc(_votesWithPartyLine.party), desc(_brokePartyLineVotes.brokePartyLineCount))
  .execute()
