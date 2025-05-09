"use server";

import { cache } from "react";
import { billInformation, billsHavingVotes, voteMetaForBill } from "@/db/queries/bills";

export const fetchBillList = cache(async () => {
  const data = await billsHavingVotes();
  return data;
});

export const fetchVoteMeta = cache(async (billId: string) => {
  const data = await voteMetaForBill(billId);
  return data;
});

export type VM = Awaited<ReturnType<typeof fetchVoteMeta>>[number];
export type EVM = VM["enriched_vote_meta"];

export const fetchBillInformation = cache(async (billId: string) => {
  const data = await billInformation(billId);
  return data;
});
