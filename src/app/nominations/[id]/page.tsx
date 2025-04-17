"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import {type NominationVotes } from "@/db/queries/nominations";
import { fetchNominationVotes, fetchNominationTitle } from "@/server/actions/nominations";
import Link from "next/link";
import VoteStackedBarChart from "@/app/components/VoteStackedBarChart";

const Page = () => {
  const { id } = useParams();
  const [title, setTitle] = useState<string>("");
  const [displayData, setDisplayData] = useState<NominationVotes[]>([]);
  const [sortType, setSortType] = useState<"party" | "position">("party");

  // On page load, fetch the data and set both the data and displayData states.
  useEffect(() => {
    const fetchData = async (id: string) => {
      const data = await fetchNominationVotes(id);
      const _title = await fetchNominationTitle(id);
      setDisplayData(data);
      setTitle(_title);
    };

    if (id) {
      let _id: string
      if (Array.isArray(id)) {
        _id = id[0];
      } else {
        _id = id;
      }
      fetchData(_id);
    }
  }, [id]);
  
  return (
    <>
      <PageHeader
        title={`Nomination # ${id}`}
        subtitle={title}
      />

      <p className="text-center">
        <Link href="/nominations">Back to Nomination List</Link>
      </p>

      <section className="flex flex-col gap-2">
        <VoteStackedBarChart data={displayData} groupBy={sortType} />

        <div>
          <button className="border-2 rounded-md" onClick={() => setSortType("party")}>Sort by Party</button>
          <button className="border-2 rounded-md" onClick={() => setSortType("position")}>Sort by Position</button>
        </div>
      </section>
    </>
  );
};

export default Page;