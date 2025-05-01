"use server";

import { cache } from "react";
import { legislator } from "@/db/queries/legislators";
import type { Legislator } from "@/db/queries/legislators";
import { AllowedChambers, AllowedParties } from "@/db/types";
import { allLegislators, stateLegislators } from "@/db/queries/legislators";

export const fetchLegislators = cache(async (
  state: string,
  chamber?: AllowedChambers,
  party?: AllowedParties,
): Promise<Legislator[]> => {
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
});

export const fetchLegislator = cache(async (id: string): Promise<Legislator> => {
  const _legislator = await legislator(id);
  return _legislator[0];
});
