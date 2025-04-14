"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";
import LegislatorList from "@/app/components/LegislatorList";
import VoteChartWrapper from "./components/VoteChartWrapper";

const states = [
  { name: "Alabama", code: "AL" },
  { name: "Alaska", code: "AK" },
  { name: "Arizona", code: "AZ" },
  { name: "Arkansas", code: "AR" },
  { name: "California", code: "CA" },
  { name: "Colorado", code: "CO" },
  { name: "Connecticut", code: "CT" },
  { name: "Delaware", code: "DE" },
  { name: "Florida", code: "FL" },
  { name: "Georgia", code: "GA" },
  { name: "Hawaii", code: "HI" },
  { name: "Idaho", code: "ID" },
  { name: "Illinois", code: "IL" },
  { name: "Indiana", code: "IN" },
  { name: "Iowa", code: "IA" },
  { name: "Kansas", code: "KS" },
  { name: "Kentucky", code: "KY" },
  { name: "Louisiana", code: "LA" },
  { name: "Maine", code: "ME" },
  { name: "Maryland", code: "MD" },
  { name: "Massachusetts", code: "MA" },
  { name: "Michigan", code: "MI" },
  { name: "Minnesota", code: "MN" },
  { name: "Mississippi", code: "MS" },
  { name: "Missouri", code: "MO" },
  { name: "Montana", code: "MT" },
  { name: "Nebraska", code: "NE" },
  { name: "Nevada", code: "NV" },
  { name: "New Hampshire", code: "NH" },
  { name: "New Jersey", code: "NJ" },
  { name: "New Mexico", code: "NM" },
  { name: "New York", code: "NY" },
  { name: "North Carolina", code: "NC" },
  { name: "North Dakota", code: "ND" },
  { name: "Ohio", code: "OH" },
  { name: "Oklahoma", code: "OK" },
  { name: "Oregon", code: "OR" },
  { name: "Pennsylvania", code: "PA" },
  { name: "Rhode Island", code: "RI" },
  { name: "South Carolina", code: "SC" },
  { name: "South Dakota", code: "SD" },
  { name: "Tennessee", code: "TN" },
  { name: "Texas", code: "TX" },
  { name: "Utah", code: "UT" },
  { name: "Vermont", code: "VT" },
  { name: "Virginia", code: "VA" },
  { name: "Washington", code: "WA" },
  { name: "West Virginia", code: "WV" },
  { name: "Wisconsin", code: "WI" },
  { name: "Wyoming", code: "WY" },
];

/**
 * Get the state code of the client from ipinfo, if available.
 * @returns The two-letter state code for US states, if available, otherwise an empty string.
 */
const getClientState = async (): Promise<string> => {
  const response = await fetch("https://ipinfo.io/json");
  const data = await response.json();
  if (data.country && data.country === "US" && data.region) {
    const foundState = states.find((s) => s.name === data.region);
    if (foundState) {
      return foundState.code;
    }
  }
  return "";
};

export default function Home() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // On page load, set the state if we can.
  useEffect(() => {
    getClientState().then((code) => {
      setSelectedState(code);
    });
  }, []);

  return (
    <>
      <PageHeader
        title="Welcome!"
        subtitle="Based on your IP location, we've picked a state. Feel free to change it, or choose 'No State Selected' to see results for all legislators."
      />

      <section className="w-full flex flex-row items-center space-x-4">
        <label
          htmlFor="state-picker"
          className="text-lg font-medium text-gray-700 dark:text-white w-40"
        >
          Select Your State:
        </label>
        <select
          name="state-picker"
          id="state-picker"
          className="w-full border border-gray-300 rounded-md p-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedState || ""}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <option value="">No State Selected</option>
          {states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </section>

      {selectedState && (
        <>
          <LegislatorList state={selectedState} />
          <VoteChartWrapper state={selectedState} />
        </>
      )}
    </>
  );
}
