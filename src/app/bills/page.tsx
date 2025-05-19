import { type BillList } from "@/db/queries/bills";
import BillListComponent from "./BillListComponent";
import PageHeader from "@/app/components/PageHeader";
import { fetchBillList } from "@/server/actions/bills";

export const categoryLookup = {
  hjres: "House Joint Resolution",
  sconres: "Senate Concurrent Resolution",
  hconres: "House Concurrent Resolution",
  sjres: "Senate Joint Resolution",
  s: "Senate Bill",
  hres: "House Resolution",
  hr: "House Bill",
  sres: "Senate Resolution",
};

export type Categories = keyof typeof categoryLookup;

export default async function BillsPage() {
  const billsResponse = await fetchBillList();
  type RecordMap = Record<Categories, BillList>;

  // Slice billsResponse based on category
  const slicedBills = billsResponse.reduce<RecordMap>((acc, curr) => {
    const { billType } = curr;
    if (billType in categoryLookup) {
      const typedBillType = billType as Categories;
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

        <BillListComponent slicedBills={slicedBills} />
      </section>
    </>
  );
}
