"use client";

import { useState } from "react";
import { type BillList } from "@/db/queries/bills";
import Chip, { ChipStyle } from "@/app/components/Chip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { billCategoryLookup, type BillCategory } from "@/exports/bills";

const chipStyleLookup: Record<string, ChipStyle> = {
  R: "rep",
  D: "dem",
};

interface BillListProps {
  slicedBills: Record<BillCategory, BillList>;
}

const allBillCategories: BillCategory[] = Object.keys(
  billCategoryLookup
) as BillCategory[];

const initialCategoryAccordions: Record<BillCategory, boolean> =
  allBillCategories.reduce((acc, category) => {
    acc[category] = true;
    return acc;
  }, {} as Record<BillCategory, boolean>);

const BILL_TITLE_MAX_LENGTH = 75;

const BillListComponent: React.FC<BillListProps> = ({ slicedBills }) => {
  const [categoryFilters, setCategoryFilters] =
    useState<BillCategory[]>(allBillCategories);

  const [categoryAccordions, setCategoryAccordions] = useState<
    Record<BillCategory, boolean>
  >(initialCategoryAccordions);

  const handleCategoryChange = (category: BillCategory) => {
    const accordions = { ...categoryAccordions };
    accordions[category] = !categoryAccordions[category];
    setCategoryAccordions(accordions);
  };

  return (
    <>
      <div className="flex flex-col gap-2 lg:gap-4 lg:items-center">
        <span className="text-lg font-medium">Filter by bill type:</span>

        {/* Filter row for bill categories */}
        <div className="flex flex-row flex-wrap gap-2">
          {(Object.keys(billCategoryLookup) as BillCategory[]).map((k) => (
            <label
              key={k}
              className="flex items-center gap-2 cursor-pointer border-2 rounded-md p-2 mr-2 mb-2 border-gray-400/75 bg-gray-400/10 hover:bg-gray-400/25"
            >
              <input
                type="checkbox"
                checked={categoryFilters.includes(k)}
                onChange={(e) =>
                  setCategoryFilters(
                    e.target.checked
                      ? [...categoryFilters, k]
                      : categoryFilters.filter((c) => c !== k)
                  )
                }
              />
              {billCategoryLookup[k]}
            </label>
          ))}
        </div>
      </div>

      {/* Actual bills by category */}
      {(Object.entries(slicedBills) as [BillCategory, BillList][]).map(
        ([k, v]) => {
          if (categoryFilters.includes(k)) {
            return (
              <section className="flex flex-col gap-2" key={k}>
                <h2
                  className="text-xl font-bold"
                  onClick={() => handleCategoryChange(k)}
                >
                  {billCategoryLookup[k]}s{" "}
                  <FontAwesomeIcon
                    icon={categoryAccordions[k] ? faEye : faEyeSlash}
                    className="fa fa-fw"
                  />
                </h2>
                <div
                  className={`grid grid-cols-2 lg:grid-cols-3 ${
                    categoryAccordions[k] ? "block" : "hidden"
                  }`}
                >
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
                        Sponsor: {bill.sponsorName} ({bill.sponsorParty})
                      </p>
                      <p className="text-md mt-4">
                        Latest Status: {bill.status} as of {bill.statusAt}
                      </p>
                    </Chip>
                  ))}
                </div>
              </section>
            );
          }
          return;
        }
      )}
    </>
  );
};

export default BillListComponent;
