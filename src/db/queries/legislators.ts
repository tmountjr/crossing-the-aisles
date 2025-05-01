import { db } from '@/db';
import type { Vote } from '@/db/types';
import { legislators, votes } from "@/db/schema";
import { eq, exists, InferSelectModel } from 'drizzle-orm';

const _allLegislators = db
  .select()
  .from(legislators)
  .where(exists(
    db.select()
      .from(votes)
      .where(eq(votes.legislatorId, legislators.id))))
  .as('all_legislators')

export const stateLegislators = (stateCode: string) => db
  .select()
  .from(_allLegislators)
  .where(eq(_allLegislators.state, stateCode))
  .execute();

export const legislator = (id: string) => db
  .select()
  .from(_allLegislators)
  .where(eq(_allLegislators.id, id))
  .limit(1)
  .execute();

export const allLegislators = db.select().from(_allLegislators).execute();

export const votesByLegislator = (id: string): Promise<Vote[]> => db
  .select()
  .from(votes)
  .where(eq(votes.legislatorId, id))
  .execute();

// export type Legislator = Awaited<typeof allLegislators>[number]; <-- this extracts the resolved type directly
export type Legislator = InferSelectModel<typeof legislators>;
