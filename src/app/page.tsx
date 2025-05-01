"use client";

import Cookies from "js-cookie";
import { states } from "@/exports/states";
import PageHeader from "@/app/components/PageHeader";
import VoteBarChart from "./components/VoteBarChart";
import { useState, useEffect, ChangeEvent } from "react";
import { AllowedChambers, AllowedParties } from "@/db/types";
import LegislatorList from "@/app/components/LegislatorList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassLocation } from "@fortawesome/free-solid-svg-icons";

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
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedChamber, setSelectedChamber] =
    useState<AllowedChambers>("all");
  const [selectedParty, setSelectedParty] = useState<AllowedParties>("all");

  // On page load, set the state if we can.
  useEffect(() => {
    const stateCode = Cookies.get("geo");
    if (stateCode) {
      setSelectedState(stateCode);
      return;
    }
    doGeoLocation();
  }, []);

  const handleSelectedStateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    Cookies.set("geo", code);
    setSelectedState(e.target.value);
  };

  const doGeoLocation = () => {
    getClientState().then((code) => {
      Cookies.set("geo", code);
      setSelectedState(code);
    });
  };

  const chamberFilterList: {
    value: AllowedChambers;
    label: string;
  }[] = [
    { value: "all", label: "Senate and House" },
    { value: "sen", label: "Senate" },
    { value: "rep", label: "House" },
  ];

  const partyFilterList: {
    value: AllowedParties;
    label: string;
  }[] = [
    { value: "all", label: "All Parties" },
    { value: "R", label: "Republican" },
    { value: "D", label: "Democrat" },
    { value: "I", label: "Independent" },
  ];

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
            className="flex-grow border border-gray-300 rounded-md p-2 text-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-950 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            value={selectedState || ""}
            onChange={handleSelectedStateChange}
          >
            <option value="">No State Selected</option>
            {states.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          <span
            className="cursor-pointer"
            onClick={doGeoLocation}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlassLocation}
              className="fa fa-fw text-2xl"
            />
          </span>
        </div>

        {/* Row 2 of the filters is all the other stuff - chamber (house, senate) and party (R, D) */}
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
          {/* Filter: chamber */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:items-center">
            <span className="text-lg font-medium">Chamber:</span>
            <div className="flex flex-row gap-2">
              {chamberFilterList.map((chamber) => (
                <label
                  key={chamber.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
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
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 lg:items-center">
            <span className="text-lg font-medium">Party:</span>
            <div className="flex flex-row gap-2">
              {partyFilterList.map((party) => (
                <label
                  key={party.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
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

      {/* Figures */}
      <LegislatorList
        state={selectedState}
        chamber={selectedChamber}
        party={selectedParty}
      />
      <VoteBarChart
        state={selectedState}
        chamber={selectedChamber}
        party={selectedParty}
      />
    </>
  );
};
