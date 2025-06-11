"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { BillList } from "@/db/queries/bills";
import PageHeader from "@/app/components/PageHeader";
import { fetchBulkBills } from "@/server/actions/bills";
import SlicedBillList from "@/app/components/SlicedBillList";
import { billCategoryLookup, type BillCategory } from "@/exports/bills";

type Reducer = Record<BillCategory, BillList>;

export default function MyBills() {
  const [myBillsRaw, setMyBillsRaw] = useState<string[]>([]);
  const [slicedBills, setSlicedBills] = useState<Reducer>();

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

      const slicedBills = bills.reduce<Reducer>((acc, curr) => {
        const { billType } = curr;
        if (billType in billCategoryLookup) {
          const typedBillType = billType as BillCategory;
          if (!acc[typedBillType]) acc[typedBillType] = [];
          acc[typedBillType].push(curr);
        }
        return acc;
      }, {} as Reducer);
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
