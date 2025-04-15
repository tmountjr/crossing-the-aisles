"use client";

import { useState, useEffect } from "react";
import { fetchLegislators, type Legislator } from "@/server/actions/legislators";
import Link from "next/link";

interface LegislatorListProps {
  state: string;
  chamber?: "sen" | "rep";
}

const LegislatorList: React.FC<LegislatorListProps> = ({ state, chamber }) => {
  const [legisData, setLegisData] = useState<Legislator[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchLegislators(state, chamber);
      setLegisData(data);
    };

    fetchData();
  }, [state, chamber]);

  return (
    <section className="w-full mt-10 flex flex-col">
      <p>
        Based on your selection, here are the legislators that match your
        filters:
      </p>
      <div className="flex flex row flex-wrap mt-2">
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
              {c} - {leg.name} ({leg.party}
              {leg.termType === "rep" ? `, ${leg.district}` : ""})
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default LegislatorList;