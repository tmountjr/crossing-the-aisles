"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import { fetchBulkBills } from "@/server/actions/bills";
import SlicedBillList from "@/app/components/SlicedBillList";
import { sliceBills, type SlicedBillRecord } from "@/exports/bills";

export default function MyBills() {
  const [myBillsRaw, setMyBillsRaw] = useState<string[]>([]);
  const [slicedBills, setSlicedBills] = useState<SlicedBillRecord>();

  useEffect(() => {
    const billListRaw = Cookies.get("billList");
    if (billListRaw && billListRaw !== "") {
      const bills = billListRaw.split(",");
      setMyBillsRaw(bills);
    } else {
      // For testing, specify a few default bills
      setMyBillsRaw(["hr1-119", "s5-119"]);
    }
  }, []);

  // When the list of bills is updated, fetch the bills.
  useEffect(() => {
    const getBills = async () => {
      const bills = await fetchBulkBills(myBillsRaw);
      const slicedBills = sliceBills(bills);
      setSlicedBills(slicedBills);
    };

    getBills();
  }, [ myBillsRaw ]);

  return (
    <>
      <PageHeader
        title="My Bills"
        subtitle="Track the bills important to you."
      />

      {slicedBills && <SlicedBillList slicedBills={slicedBills} />}
    </>
  );
}
