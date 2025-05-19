import { type BillList } from "@/db/queries/bills";
import BillListComponent from "./BillListComponent";
import PageHeader from "@/app/components/PageHeader";
import { fetchBillList } from "@/server/actions/bills";
import { billCategoryLookup, type BillCategory } from "@/exports/bills";

export const revalidate = 3600; // 1h

export default async function BillsPage() {
  const billsResponse = await fetchBillList();
  type RecordMap = Record<BillCategory, BillList>;

  // Slice billsResponse based on category
  const slicedBills = billsResponse.reduce<RecordMap>((acc, curr) => {
    const { billType } = curr;
    if (billType in billCategoryLookup) {
      const typedBillType = billType as BillCategory;
      if (!acc[typedBillType]) acc[typedBillType] = [];
      acc[typedBillType].push(curr);
    }
    return acc;
  }, {} as RecordMap);

  return (
    <>
      <PageHeader title="Bills" />

      <section className="mt-20 flex flex-col gap-8 lg:max-w-[768px] m-auto">
        <p>
          These are all the bills that have roll call votes, broken down by bill
          category. They are sorted by the date of the last action on the bill
          (most recent first).
        </p>
        <p>
          Please see{" "}
          <a
            href="https://github.com/unitedstates/congress/wiki/bills#bill-status-codes"
            rel="noopener noreferrer"
            target="_blank"
            className="underline"
          >
            this page
          </a>{" "}
          for more information on bill status codes.
        </p>

        <BillListComponent slicedBills={slicedBills} />
      </section>
    </>
  );
}
