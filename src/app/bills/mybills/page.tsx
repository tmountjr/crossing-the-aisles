"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import { fetchBulkBills } from "@/server/actions/bills";
import { useFavoriteBills } from "@/exports/favoriteBills";
import SlicedBillList from "@/app/components/SlicedBillList";
import { sliceBills, type SlicedBillRecord } from "@/exports/bills";

export default function MyBills() {
  const [slicedBills, setSlicedBills] = useState<SlicedBillRecord>();

  const favoriteBills = useFavoriteBills();

  // When the list of bills is updated, fetch the bills.
  useEffect(() => {
    const getBills = async () => {
      const bills = await fetchBulkBills(favoriteBills);
      const slicedBills = sliceBills(bills);
      setSlicedBills(slicedBills);
    };

    if (favoriteBills.length > 0) {
      getBills();
    }
  }, [favoriteBills]);

  return (
    <>
      <PageHeader
        title="My Bills"
        subtitle="Track the bills important to you."
      />

      <section className="mt-20 flex flex-col gap-8 lg:max-w-[768px] m-auto">
        <p>
          These are the bills that you have marked as interesting to you. You
          can toggle the favorites by clicking the bookmark icon on each bill.
          Please note: a page refresh will be required to remove any bills
          removed from the favorites list.
        </p>
        <p>
          This feature stores your favorite bills as a cookie. Please see the{" "}
          <Link
            href="http://localhost:3000/about#cookie-policy"
            rel="noopener noreferrer"
            target="_blank"
             className="underline"
          >
            Cookie Policy
          </Link>{" "}
          for more information.
        </p>
        {favoriteBills.length === 0 && (
          <p>
            It looks like you don&apos;t have any favorite bills stored. Go to
            the{" "}
            <Link href="/bills" rel="noopener noreferrer" className="underline">
              Bills page
            </Link>{" "}
            to add favorite bills.
          </p>
        )}
        {favoriteBills.length > 0 && slicedBills && <SlicedBillList slicedBills={slicedBills} />}
      </section>
    </>
  );
}
