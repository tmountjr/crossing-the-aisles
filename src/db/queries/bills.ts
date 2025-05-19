import { db } from "@/db";
import { asc, desc, eq, exists, getTableColumns, InferSelectModel, or } from "drizzle-orm";
import { _votesGroupedByPartywithPartyLine } from "@/db/queries/partylineFull";
import { amendments, bills, legislators, enrichedVoteMeta as vm } from "@/db/schema";

// This will be for the bill landing page - distinct bills with votes and sponsor
// details.
const _billsHavingVotes = db
  .select({
    ...getTableColumns(bills),
    sponsorName: legislators.name,
    sponsorParty: legislators.caucus,
  })
  .from(bills)
  .innerJoin(legislators, eq(bills.sponsorId, legislators.bioguideId))
  .where(
    exists(
      db.select()
      .from(vm)
      .where(eq(bills.billId, vm.billId))
    )
  )
  .orderBy(desc(bills.statusAt))
  .as("bills_having_votes");

export const billsHavingVotes = () => db.select().from(_billsHavingVotes).execute();
export type BillList = Awaited<ReturnType<typeof billsHavingVotes>>;
export type BillListItem = BillList[number];
export type Bill = InferSelectModel<typeof bills>;

export const voteMetaForBill = (billId: string) => {
  return db
    .select()
    .from(vm)
    .leftJoin(amendments, eq(vm.amendmentId, amendments.amendmentId))
    .leftJoin(_votesGroupedByPartywithPartyLine, eq(vm.voteId, _votesGroupedByPartywithPartyLine.voteId))
    .where(eq(vm.billId, billId))
    .orderBy(asc(vm.date))
    .execute();
};

export const billInformation = async (billId: string) => {
  const b = await db
    .select({
      ...getTableColumns(bills),
      sponsorName: legislators.name,
      sponsorParty: legislators.caucus,
      sponsorState: legislators.state,
    })
    .from(bills)
    .leftJoin(legislators, eq(bills.sponsorId, legislators.bioguideId))
    .where(eq(bills.billId, billId))
    .limit(1)
    .execute();

  return b[0];
};

export const sponsoredBillsByLegislator = (id: string) => {
  return db
    .select({ ...getTableColumns(bills) })
    .from(bills)
    .leftJoin(legislators, eq(bills.sponsorId, legislators.bioguideId))
    .where(or(eq(legislators.bioguideId, id), eq(legislators.id, id)))
    .execute();
}