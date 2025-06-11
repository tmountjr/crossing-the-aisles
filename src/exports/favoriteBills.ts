import Cookies from "js-cookie";
import { useState, useEffect } from "react";

export const useFavoriteBills = (defaultBills: string[] = []) => {
  const [favoriteBills, setFavoriteBills] = useState<string[]>(defaultBills);

  useEffect(() => {
    const billListRaw = Cookies.get("billList");
    if (billListRaw && billListRaw !== "") {
      const bills = billListRaw.split(",");
      console.log(bills);
      setFavoriteBills(bills);
    }
  }, []);

  return favoriteBills;
}

/**
 * Add a favorite bill to the billList cookie.
 * @param billId The bill ID to add to the cookie.
 */
export const addFavoriteBill = (billId: string) => {
  const currentBillsRaw = Cookies.get("billList") || "";
  const currentBills = new Set(currentBillsRaw.split(","));
  currentBills.add(billId);
  Cookies.set("billList", [...currentBills].join(","));
}

/**
 * Remove a favorite bill from the billList cookie.
 * @param billId The bill ID to remove from the cookie.
 */
export const removeFavoriteBill = (billId: string) => {
  const currentBillsRaw = Cookies.get("billList") || "";
  const currentBills = new Set(currentBillsRaw.split(","));
  currentBills.delete(billId);
  Cookies.set("billList", [...currentBills].join(","));
}

/**
 * Toggle the favorite status of a bill ID in the billList cookie.
 * @param billId The bill ID to toggle.
 */
export const toggleFavoriteBill = (billId: string) => {
  const currentBillsRaw = Cookies.get("billList") || "";
  const currentBills = new Set(currentBillsRaw.split(","));
  if (currentBills.has(billId)) {
    removeFavoriteBill(billId);
  } else {
    addFavoriteBill(billId);
  }
}