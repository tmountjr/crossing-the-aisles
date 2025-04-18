import { db } from '@/db';
import {
  legislators
} from '@/db/schema';
import { eq } from 'drizzle-orm';

export type AllowedParties = "R" | "D" | "I" | "all";

export const allLegislators = db
  .select()
  .from(legislators)
  .execute()

export const stateLegislators = (stateCode: string) => db
  .select()
  .from(legislators)
  .where(eq(legislators.state, stateCode))
  .execute();

export const legislator = (id: string) => db
  .select()
  .from(legislators)
  .where(eq(legislators.id, id))
  .limit(1)
  .execute();