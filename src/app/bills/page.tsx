import { type BillList } from "@/db/queries/bills";
import PageHeader from "@/app/components/PageHeader";
import { fetchBillList } from "@/server/actions/bills";
import Chip, { ChipStyle } from "@/app/components/Chip";

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

const chipStyleLookup: Record<string, ChipStyle> = {
  R: "rep",
  D: "dem",
};

type Categories = keyof typeof categoryLookup;

const BILL_TITLE_MAX_LENGTH = 75;

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
        {(Object.entries(slicedBills) as [Categories, BillList][]).map(
          ([k, v]) => (
            <section className="flex flex-col gap-2" key={k}>
              <h2 className="text-xl font-bold">{categoryLookup[k]}s</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3">
                {v.map((bill) => (
                  <Chip
                    key={bill.billId}
                    style={chipStyleLookup[bill.sponsorParty!]}
                    href={`/bills/${bill.billId}`}
                  >
                    <h2 className="text-xl font-bold">{bill.billId}</h2>
                    <h3 className="text-md text-gray-700 dark:text-gray-300 italic">
                      {bill.shortTitle ||
                        bill.title.substring(0, BILL_TITLE_MAX_LENGTH) +
                          (bill.title.length > BILL_TITLE_MAX_LENGTH
                            ? "..."
                            : "")}
                    </h3>
                    <p className="text-md mt-4">
                      Latest Status: {bill.status} as of {bill.statusAt}
                    </p>
                  </Chip>
                ))}
              </div>
            </section>
          )
        )}
      </section>
    </>
  );
}
