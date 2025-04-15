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
  const [selectedChamber, setSelectedChamber] = useState<"sen" | "rep" | "all">("all");
  const [selectedParty, setSelectedParty] = useState<"R" | "D" | "I" | "all">("all");

  // On page load, set the state if we can.
  useEffect(() => {
    getClientState().then((code) => {
      setSelectedState(code);
    });
  }, []);

  const chamberFilterList: {
    value: "sen" | "rep" | "all";
    label: string;
  }[] = [
    { value: "all", label: "Senate and House"},
    { value: "sen", label: "Senate" },
    { value: "rep", label: "House" },
  ];

  const partyFilterList: {
    value: "R" | "D" | "I" | "all";
    label: string;
  }[] = [
    { value: "all", label: "All Parties" },
    { value: "R", label: "Republican" },
    { value: "D", label: "Democrat" },
    { value: "I", label: "Independent" },
  ]

  return (
    <>
      <PageHeader
        title="Welcome!"
        subtitle="Based on your IP location, we've picked a state. Feel free to change it, or choose 'No State Selected' to see results for all legislators."
      />

      {/* Filters */}
      <section className="w-full flex flex-col gap-4">

        {/* Row 1 of the filters is just the state selector to make it stand out. */}
        <div className="flex flex-row items-center gap-2">
          <label htmlFor="state-picker" className="text-lg font-medium">
            Select Your State:
          </label>
          <select
            name="state-picker"
            id="state-picker"
            className="flex-grow border border-gray-300 rounded-md p-2 text-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
        </div>

        {/* Row 2 of the filters is all the other stuff - chamber (house, senate) and party (R, D) */}
        <div className="flex flex-row gap-10">

          {/* Filter: chamber */}
          <div className="flex flex-row gap-4">
            <span className="text-lg font-medium">Chamber:</span>
            <div className="flex flex-row gap-2">
              {chamberFilterList.map((chamber) => (
                <label key={chamber.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="chamber"
                    value={chamber.value}
                    checked={chamber.value === selectedChamber}
                    onChange={() => setSelectedChamber(chamber.value)}
                    className="focus:ring-2 focus:ring-sky-500"
                  />
                  {chamber.label}
                </label>
              ))}
            </div>
          </div>

          {/* Filter: party */}
          <div className="flex flex-row gap-4">
            <span className="text-lg font-medium">Party:</span>
            <div className="flex flex-row gap-2">
              {partyFilterList.map((party) => (
                <label key={party.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="party"
                    value={party.value}
                    checked={party.value === selectedParty}
                    onChange={() => setSelectedParty(party.value)}
                    className="focus:ring-2 focus:ring-sky-500"
                  />
                  {party.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedState && (
        <>
          <LegislatorList state={selectedState} chamber={selectedChamber} party={selectedParty} />
          <VoteChartWrapper state={selectedState} chamber={selectedChamber} party={selectedParty} />
        </>
      )}
    </>
  );
}
