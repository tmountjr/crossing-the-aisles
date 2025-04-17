"use server";

import { lawmakerVotesByNomination, nominationTitle, type NominationVotes } from "@/db/queries/nominations";

export async function fetchNominationVotes(id: string): Promise<NominationVotes[]> {
  return lawmakerVotesByNomination(id);
}

export async function fetchNominationTitle(id: string): Promise<string> {
  const _title = await nominationTitle(id);
  return _title[0].title || "No title found.";
}