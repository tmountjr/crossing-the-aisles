"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import { fetchBulkBills } from "@/server/actions/bills";
import SlicedBillList from "@/app/components/SlicedBillList";
import { sliceBills, type SlicedBillRecord } from "@/exports/bills";
import { useFavoriteBills } from "@/exports/favoriteBills";

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
        <p>These are the bills that you have marked as interesting to you.</p>
        {slicedBills && <SlicedBillList slicedBills={slicedBills} />}
      </section>
    </>
  );
}
