import { db } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  bills as b,
  votes as v,
  legislators as l,
  enrichedVoteMeta as vm,
  latestVoteIds as v_ids,
} from "@/db/schema";

// First get the 10 most recent votes.
const recentVotes = db
  .select({
    voteId: v_ids.voteId,
    billId: v_ids.billId,
    chamber: v_ids.chamber,
    date: v_ids.date,
    result: v_ids.result,
    category: v_ids.category,
    nominationTitle: v_ids.nominationTitle,
    title: b.title,
    sponsorParty: vm.sponsorParty,
  })
  .from(v_ids)
  .innerJoin(vm, eq(v_ids.voteId, vm.voteId))
  .leftJoin(b, eq(v_ids.billId, b.billId))
  .orderBy(desc(v_ids.date))
  .limit(10)
  .as("recent_votes");

// Now fetch all vote details pertaining to those votes and determine if it's
// a party line vote or not.
// A party line vote is determined by:
//   legislator_party = sponsor_party and position = "yea"
const allVotes = db
  .select({
    voteId: v.voteId,
    legislatorId: v.legislatorId,
    position: v.position,
    billId: recentVotes.billId,
    sponsorParty: recentVotes.sponsorParty,
    date: recentVotes.date,
    category: recentVotes.category,
    nominationTitle: recentVotes.nominationTitle,
    title: recentVotes.title,
    name: l.name,
    party: l.party,
    isPartyLine: sql<boolean>`
      CASE
        WHEN (${l.party} = ${recentVotes.sponsorParty} AND ${v.position} != 'Nay') 
          OR (${l.party} != ${recentVotes.sponsorParty} AND ${v.position} != 'Yea')
        THEN TRUE
        ELSE FALSE
      END`.as("is_party_line")
  })
  .from(v)
  .innerJoin(recentVotes, eq(v.voteId, recentVotes.voteId))
  .innerJoin(l, eq(v.legislatorId, l.id))
  .as("all_votes");

// Finally, summarize those votes by how many did or did not vote along party lines.
export const data = await db
  .select({
    voteId: allVotes.voteId,
    billId: allVotes.billId,
    date: allVotes.date,
    category: allVotes.category,
    title: sql<string>`CASE WHEN ${allVotes.category} = 'nomination' THEN ${allVotes.nominationTitle} ELSE ${allVotes.title} END`.as('title'),
    rPartyLine: sql<boolean>`SUM(CASE WHEN ${allVotes.party} = 'R' AND ${allVotes.isPartyLine} = 1 THEN 1 ELSE 0 END)`.as("r_party_line"),
    rNotPartyLine: sql<boolean>`SUM(CASE WHEN ${allVotes.party} = 'R' AND ${allVotes.isPartyLine} = 0 THEN 1 ELSE 0 END)`.as("r_not_party_line"),
    dPartyLine: sql<boolean>`SUM(CASE WHEN ${allVotes.party} = 'D' AND ${allVotes.isPartyLine} = 1 THEN 1 ELSE 0 END)`.as("d_party_line"),
    dNotPartyLine: sql<boolean>`SUM(CASE WHEN ${allVotes.party} = 'D' AND ${allVotes.isPartyLine} = 0 THEN 1 ELSE 0 END)`.as("d_not_party_line")
  })
  .from(allVotes)
  .groupBy(allVotes.voteId)
  .orderBy(desc(allVotes.date))
  .execute();
