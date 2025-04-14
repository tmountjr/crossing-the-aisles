import { db } from '@/db';
import {
  votes as v,
  legislators as l,
  latestVoteIds as vm,
} from '@/db/schema';
import { and, asc, eq, inArray, not } from 'drizzle-orm';

// Subquery select to filter for just nomination votes
const nominationVotes = db
  .select({
    voteId: v.voteId,
    date: vm.date,
    legislatorId: v.legislatorId,
    name: l.name,
    state: l.state,
    party: l.party,
    position: v.position,
    title: vm.nominationTitle
  })
  .from(v)
  .innerJoin(vm, eq(v.voteId, vm.voteId))
  .innerJoin(l, eq(v.legislatorId, l.lisId))
  .where(eq(vm.category, 'nomination'))
  .as('nomination_votes');

// Subquery select to get the individual nomination votes.
const _nominationVoteIds = db
  .selectDistinct({
    voteId: nominationVotes.voteId,
    date: nominationVotes.date,
    title: nominationVotes.title
  })
  .from(nominationVotes)
  .orderBy(asc(nominationVotes.date))

  /**
   * Get all individual votes for a single vote.
   * @param voteId The Vote ID.
   * @param party  If provided, limit return to a specific party's voters.
   * @returns The nominationVote object for the given vote.
   */
export const lawmakerVotesByNomination = async (voteId: string, party: string = 'all') => {
  if (party === 'all') {
    return db
      .select()
      .from(nominationVotes)
      .where(eq(nominationVotes.voteId, voteId))
      .orderBy(asc(nominationVotes.party))
  } else if (party === 'd') {
    return db
      .select()
      .from(nominationVotes)
      .where(and(
        eq(nominationVotes.voteId, voteId),
        eq(nominationVotes.party, 'D')
      ))
      .orderBy(asc(nominationVotes.party))
  } else if (party === 'r') {
    return db
      .select()
      .from(nominationVotes)
      .where(and(
        eq(nominationVotes.voteId, voteId),
        eq(nominationVotes.party, 'R')
      ))
      .orderBy(asc(nominationVotes.party))
  } else {
    return db
      .select()
      .from(nominationVotes)
      .where(and(
        eq(nominationVotes.voteId, voteId),
        not(inArray(nominationVotes.party, ['R', 'D']))
      ))
      .orderBy(asc(nominationVotes.party))
  }
}

export const nominationVoteIds = _nominationVoteIds.execute()