"use server";

import { legislators } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { allLegislators, stateLegislators } from "@/db/queries/legislators";

export async function fetchLegislators(
  state: string,
  chamber?: "sen" | "rep",
  party?: "R" | "D" | "I"
) {
  let legisData;
  if (state !== "") {
    legisData = await stateLegislators(state);
  } else {
    legisData = await allLegislators;
  }

  if (chamber) {
    legisData = legisData.filter(leg => leg.termType === chamber);
  }

  if (party) {
    legisData = legisData.filter(leg => leg.party === party);
  }

  return legisData;
}

// export type Legislator = Awaited<typeof allLegislators>[number]; <-- this extracts the resolved type directly
export type Legislator = InferSelectModel<typeof legislators>;