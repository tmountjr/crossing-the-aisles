"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import {type NominationVotes } from "@/db/queries/nominations";
import { fetchNominationVotes, fetchNominationTitle } from "@/server/actions/nominations";
import Link from "next/link";
import VoteDonutChart from "@/app/components/VoteDonutChart";

const Page = () => {
  const { id } = useParams();
  const [title, setTitle] = useState<string>("");
  const [displayData, setDisplayData] = useState<NominationVotes[]>([]);

  // On page load, fetch the data and set both the data and displayData states.
  useEffect(() => {
    const fetchData = async (id: string) => {
      const data = await fetchNominationVotes(id);
      const _title = await fetchNominationTitle(id);
      console.log(_title)
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

      <section className="flex flexcol xl:flex-row gap-2">
        <VoteDonutChart data={displayData} groupBy="position" />
      </section>
    </>
  );
};

export default Page;