import { voteMeta, votes } from "./schema";
import { InferSelectModel } from "drizzle-orm";

export type VoteMeta = InferSelectModel<typeof voteMeta>;
export type LatestVoteId = VoteMeta & { "uniqueMatchingField": string };
export type Vote = InferSelectModel<typeof votes>;
export type AllowedChambers = "sen" | "rep" | "all";
export type AllowedParties = "R" | "D" | "I" | "all";
