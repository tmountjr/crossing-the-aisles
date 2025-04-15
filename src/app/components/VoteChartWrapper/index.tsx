"use client";

import { useEffect, useState } from "react";
import VoteChart from "@/app/components/VoteChart";
import { BrokePartyLinesData } from "@/db/queries/partyline";
import { fetchBplData } from "@/server/actions/brokePartyLines";
import { type BrokePartyLinesFilters } from "@/db/queries/partyline";

const VoteChartWrapper: React.FC<BrokePartyLinesFilters> = ({
  state,
  chamber,
  party,
  legislatorIds,
}: BrokePartyLinesFilters) => {
  const [bplData, setBplData] = useState<BrokePartyLinesData[]>([]);

  useEffect(() => {
    const chamberToFetch = chamber === "all" ? undefined : chamber;
    fetchBplData({ state, chamber: chamberToFetch, party, legislatorIds }).then(
      (data) => {
        setBplData(data);
      }
    );
  }, [state, chamber, party, legislatorIds]);

  return <VoteChart data={bplData} />;
};

export default VoteChartWrapper;
