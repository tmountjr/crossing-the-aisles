"use server";

import { cache } from "react";
import { lawmakerVotesByNomination, nominationTitle, type NominationVotes } from "@/db/queries/nominations";

export const fetchNominationVotes = cache(async (id: string): Promise<NominationVotes[]> => {
  return lawmakerVotesByNomination(id);
});

export const fetchNominationTitle = cache(async (id: string): Promise<string> => {
  const _title = await nominationTitle(id);
  return _title[0].title || "No title found.";
});
