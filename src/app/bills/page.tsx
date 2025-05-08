import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { billList, type BillList } from "@/db/queries/bills";

const categoryLookup = {
  hjres: "House Joint Resolution",
  sconres: "Senate Concurrent Resolution",
  hconres: "House Concurrent Resolution",
  sjres: "Senate Joint Resolution",
  s: "Senate Bill",
  hres: "House Resolution",
  hr: "House Bill",
  sres: "Senate Resolution",
};

type Categories = keyof typeof categoryLookup;

export default async function BillsPage() {
  const billsResponse: BillList = await billList();
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

      <section className="mt-20 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        {(Object.entries(slicedBills) as [Categories, BillList][]).map(
          ([k, v]) => (
            <div key={k}>
              <h2 className="text-xl font-bold">{categoryLookup[k]}s</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3">
                {v.map((bill) => (
                  <Link
                    key={bill.billId}
                    href={`/bills/${bill.billId}`}
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {bill.billId}
                  </Link>
                ))}
              </div>
            </div>
          )
        )}
      </section>
    </>
  );
}
