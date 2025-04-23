import { db } from '@/db';
import {
  legislators,
  votes
} from "@/db/schema";
import { eq, exists } from 'drizzle-orm';

export type AllowedParties = "R" | "D" | "I" | "all";

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