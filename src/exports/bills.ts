import { type BillList } from "@/db/queries/bills";

export const billCategoryLookup = {
  hjres: "House Joint Resolution",
  sconres: "Senate Concurrent Resolution",
  hconres: "House Concurrent Resolution",
  sjres: "Senate Joint Resolution",
  s: "Senate Bill",
  hres: "House Simple Resolution",
  hr: "House Bill",
  sres: "Senate Simple Resolution",
};

export type BillCategory = keyof typeof billCategoryLookup;

export type SlicedBillRecord = Record<BillCategory, BillList>;

export const sliceBills = (bills: BillList): SlicedBillRecord => {
  const slicedBills = bills.reduce<SlicedBillRecord>((acc, curr) => {
    const { billType } = curr;
    if (billType in billCategoryLookup) {
      const typedBillType = billType as BillCategory;
      if (!acc[typedBillType]) acc[typedBillType] = [];
      acc[typedBillType].push(curr);
    }
    return acc;
  }, {} as SlicedBillRecord);
  return slicedBills;
}