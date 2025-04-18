"use server";

import { legislators } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { AllowedChambers } from "@/db/queries/partyline";
import { AllowedParties, legislator } from "@/db/queries/legislators";
import { allLegislators, stateLegislators } from "@/db/queries/legislators";

// export type Legislator = Awaited<typeof allLegislators>[number]; <-- this extracts the resolved type directly
export type Legislator = InferSelectModel<typeof legislators>;

export async function fetchLegislators(
  state: string,
  chamber?: AllowedChambers,
  party?: AllowedParties,
): Promise<Legislator[]> {
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

export async function fetchLegislator(id: string): Promise<Legislator> {
  const _legislator = await legislator(id);
  return _legislator[0];
}
