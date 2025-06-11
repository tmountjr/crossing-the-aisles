import { sliceBills } from "@/exports/bills";
import PageHeader from "@/app/components/PageHeader";
import { fetchBillList } from "@/server/actions/bills";
import SlicedBillList from "@/app/components/SlicedBillList";
import Link from "next/link";

export const revalidate = 3600; // 1h

export default async function BillsPage() {
  const billsResponse = await fetchBillList();

  // Slice billsResponse based on category
  const slicedBills = sliceBills(billsResponse);

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
        <p>
          Please note that you can toggle the bookmark icon on any bill to save
          that as a favorite bill. See{" "}
          <Link
            href="/bills/mybills"
            rel="noopener noreferrer"
            className="underline"
          >
            the My Bills page
          </Link>{" "}
          to browse your favorites.
        </p>

        <SlicedBillList slicedBills={slicedBills} />
      </section>
    </>
  );
}
