"use client";

import type { BrokePartyLinesFilters, BrokePartyLinesData } from "@/db/queries/partyline";
import { fetchBplData } from "@/server/actions/brokePartyLines";
import { useEffect, useState } from "react";

const VoteChart: React.FC<BrokePartyLinesFilters> = ({ state, chamber, party, legislatorIds }) => {
  const [bplData, setBplData] = useState<BrokePartyLinesData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchBplData({ state, chamber, party, legislatorIds});
      setBplData(data);
    };

    fetchData();
  }, [state, chamber, party, legislatorIds])
  
  return (
    <section className="mt-10">
      {/* For right now just output a raw table, we'll dress it up later. */}
      {bplData.length && (
        <table>
          <thead>
            <tr>
              <th>Legislator</th>
              <th>Total Votes</th>
              <th>Votes Across Party Lines</th>
            </tr>
          </thead>
          <tbody>
            {bplData.map((d) => (
              <tr key={d.legislatorId}>
                <td>{d.name}</td>
                <td>{d.totalVoteCount}</td>
                <td>{d.brokePartyLineCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default VoteChart;
