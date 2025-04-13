import { db } from '@/db';
import {
  votes as v,
  legislators as l,
  latestVoteIds as vm,
} from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

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
   * @returns The nominationVote object for the given vote.
   */
export const lawmakerVotesByNomination = async (voteId: string) => {
  return db
    .select()
    .from(nominationVotes)
    .where(eq(nominationVotes.voteId, voteId))
    .orderBy(asc(nominationVotes.party))
    .execute()
}

export const nominationVoteIds = _nominationVoteIds.execute()