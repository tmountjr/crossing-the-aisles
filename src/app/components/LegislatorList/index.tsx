"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AllowedChambers } from "@/db/queries/partyline";
import { AllowedParties } from "@/db/queries/legislators";
import {
  fetchLegislators,
  type Legislator,
} from "@/server/actions/legislators";

interface LegislatorListProps {
  state: string;
  chamber?: AllowedChambers;
  party?: AllowedParties;
}

const LegislatorList: React.FC<LegislatorListProps> = ({
  state,
  chamber,
  party,
}) => {
  const [legisData, setLegisData] = useState<Legislator[]>([]);
  const [expanded, setExpanded] = useState(false);

  const shouldCollapse = legisData.length > 15;

  useEffect(() => {
    const chamberToFetch = chamber === "all" ? undefined : chamber;
    const partyToFetch = party === "all" ? undefined : party;
    const fetchData = async () => {
      const data = await fetchLegislators(state, chamberToFetch, partyToFetch);
      setLegisData(data);
    };

    fetchData();
  }, [state, chamber, party]);

  return (
    <section className="w-full mt-10 flex flex-col">
      <p>
        Based on your selection, here are the legislators that match your
        filters:
      </p>
      <div
        className={`relative overflow-hidden transition-[max-height] duration-500 ease-in-out ${
          expanded || !shouldCollapse ? "max-h-none" : "max-h-[100px]"
        }`}
      >
        <div className="flex flex-row flex-wrap mt-2">
          {legisData.map((leg) => {
            const c = leg.termType === "sen" ? "Senate" : "House";

            // Apply border and background styling based on the legislator's party.
            // Can't make it dynamic because of how Tailwind shakes out all the styles.
            let linkStyle;
            if (leg.party === "D") {
              linkStyle = "border-dem/75 bg-dem/10 hover:bg-dem/25";
            } else if (leg.party === "R") {
              linkStyle = "border-rep/75 bg-rep/10 hover:bg-rep/25";
            } else {
              linkStyle = "border-ind/75 bg-ind/10 hover:bg-ind/25";
            }

            return (
              <Link
                key={leg.id}
                href={`/legislator/${leg.id}`}
                className={`border border-2 ${linkStyle} rounded-md p-2 mr-2 mb-2`}
              >
                {c} - {leg.name} ({leg.party}, {leg.state}
                {leg.termType === "rep" ? `-${leg.district}` : ""})
              </Link>
            );
          })}
        </div>
        {!expanded && shouldCollapse && (
          <div className="absolute bottom-0 w-full h-[30px] bg-gradient-to-t to-transparent from-white"></div>
        )}
      </div>
      {shouldCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-blue-600 underline"
        >
          {expanded
            ? "Click to collapse the list."
            : "Click to expand the full list."}
        </button>
      )}
    </section>
  );
};

export default LegislatorList;
