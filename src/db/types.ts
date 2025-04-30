import { voteMeta, votes } from "./schema";
import { InferSelectModel } from "drizzle-orm";

type VoteMeta = InferSelectModel<typeof voteMeta>;

export type LatestVoteId = VoteMeta & { "uniqueMatchingField": string };
export type Vote = InferSelectModel<typeof votes>;
