"use client";

import Chip from "@/app/components/Chip";
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
          expanded || !shouldCollapse ? "max-h-none" : "max-h-[150px]"
        }`}
      >
        <div className="flex flex-row flex-wrap mt-2">
          {legisData.map((leg) => {
            const c = leg.termType === "sen" ? "Senate" : "House";

            return (
              <Chip
                key={leg.id}
                href={`/legislator/${leg.id}`}
                style={leg.party === "D" ? "dem" : leg.party === "R" ? "rep" : "ind"}
              >
                {c} - {leg.name} ({leg.party}, {leg.state}
                {leg.termType === "rep" ? `-${leg.district}` : ""})
              </Chip>
            );
          })}
        </div>
        {!expanded && shouldCollapse && (
          <div className="absolute bottom-0 w-full h-[30px] bg-gradient-to-t to-transparent from-background"></div>
        )}
      </div>
      {shouldCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-blue-600  dark:text-blue-300 underline"
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
