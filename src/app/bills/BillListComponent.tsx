"use client";

import { useState } from "react";
import { type BillList } from "@/db/queries/bills";
import Chip, { ChipStyle } from "@/app/components/Chip";
import { billCategoryLookup, type BillCategory } from "@/exports/bills";

const chipStyleLookup: Record<string, ChipStyle> = {
  R: "rep",
  D: "dem",
};

interface BillListProps {
  slicedBills: Record<BillCategory, BillList>;
}

const BILL_TITLE_MAX_LENGTH = 75;

const BillListComponent = ({ slicedBills }: BillListProps) => {
  const [showCategories, setShowCategories] = useState<BillCategory[]>(
    Object.keys(billCategoryLookup) as BillCategory[]
  );

  return (
    <>
      <div className="flex flex-col gap-2 lg:gap-4 lg:items-center">
        <span className="text-lg font-medium">Filter by bill type:</span>
        <div className="flex flex-row flex-wrap gap-2">
          {(Object.keys(billCategoryLookup) as BillCategory[]).map((k) => (
            <label
              key={k}
              className="flex items-center gap-2 cursor-pointer border-2 rounded-md p-2 mr-2 mb-2 border-gray-400/75 bg-gray-400/10 hover:bg-gray-400/25"
            >
              <input
                type="checkbox"
                checked={showCategories.includes(k)}
                onChange={(e) =>
                  setShowCategories(
                    e.target.checked
                      ? [...showCategories, k]
                      : showCategories.filter((c) => c !== k)
                  )
                }
              />
              {billCategoryLookup[k]}
            </label>
          ))}
        </div>
      </div>

      {(Object.entries(slicedBills) as [BillCategory, BillList][]).map(
        ([k, v]) => (
          <>
            {showCategories.includes(k) && (
              <section className="flex flex-col gap-2" key={k}>
                <h2 className="text-xl font-bold">{billCategoryLookup[k]}s</h2>
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
            )}
          </>
        )
      )}
    </>
  );
};

export default BillListComponent;
