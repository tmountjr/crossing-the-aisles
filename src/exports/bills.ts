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