"use client";

import { useState, useEffect } from "react";
import { fetchLegislators, type Legislator } from "@/server/actions/legislators";

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
    <section className="w-full mt-10">
      <p>
        Based on your selection, here are the legislators that match your
        filters:
      </p>
      <div className="flex flex row flex-wrap mt-2">
        {legisData.map((leg) => {
          const c = leg.termType === "sen" ? "Senate" : "House";

          return (
            <span key={leg.id} className="border rounded-md p-2 mr-2 mb-2">
              {c} - {leg.name} ({leg.party}
              {leg.termType === "rep" ? `, ${leg.district}` : ""})
            </span>
          );
        })}
      </div>
    </section>
  );
};

export default LegislatorList;