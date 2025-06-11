import Cookies from "js-cookie";
import { useState, useEffect } from "react";

export const useFavoriteBills = (defaultBills: string[] = []) => {
  const [favoriteBills, setFavoriteBills] = useState<string[]>(defaultBills);

  const updateFavorites = () => {
    const billListRaw = Cookies.get("billList");
    setFavoriteBills(billListRaw ? billListRaw.split(",") : []);
  };

  useEffect(() => {
    updateFavorites();

    const handleUpdate = () => updateFavorites();
    window.addEventListener("billListChanged", handleUpdate);

    return () => window.removeEventListener("billListChanged", handleUpdate);
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
  dispatchChange();
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
  dispatchChange();
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

const dispatchChange = () => window.dispatchEvent(new Event("billListChanged"));