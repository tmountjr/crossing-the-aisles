import { db } from "@/db";
import { asc, eq, getTableColumns, sql } from "drizzle-orm";
import { amendments, bills, enrichedVoteMeta as vm } from "@/db/schema";

// Limit the list of bills to just ones with recorded votes.
const _billsWithVotes = db
  .selectDistinctOn(
    [bills.billId],
    { ...getTableColumns(bills) }
  )
  .from(bills)
  .innerJoin(vm, eq(bills.billId, vm.billId))
  .as("bills_with_votes")

// Join the bills list with the vote_meta table to get sponsor data and order
// the results.
const _billList = db
  .select({
    ...getTableColumns(bills),
    sponorName: vm.sponsorName,
    sponsorParty: vm.sponsorParty,
  })
  .from(_billsWithVotes)
  .innerJoin(bills, eq(_billsWithVotes.billId, bills.billId))
  .leftJoin(vm, eq(_billsWithVotes.sponsorId, vm.billId))
  .orderBy(asc(_billsWithVotes.billType), asc(sql<number>`cast(${_billsWithVotes.billNumber} as int)`))
  .as("bill_list");

export const billList = async () => db.select().from(_billList).execute();
export type BillList = Awaited<ReturnType<typeof billList>>;
export type BillListItem = BillList[number];

export const voteMetaForBill = (billId: string) => {
  return db
    .select()
    .from(vm)
    .leftJoin(amendments, eq(vm.amendmentId, amendments.amendmentId))
    .where(eq(vm.billId, billId))
    .orderBy(asc(sql<number>`cast(${vm.voteNumber} as int)`))
    .execute();
};

export const billInformation = async (billId: string) => {
  const b = await db
    .select()
    .from(bills)
    .where(eq(bills.billId, billId))
    .limit(1)
    .execute();

  return b[0];
};
