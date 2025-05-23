"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import Chip, {type ChipStyle } from "@/app/components/Chip";
import { type NominationVotes } from "@/db/queries/nominations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import VoteStackedBarChart from "@/app/components/VoteStackedBarChart";

type ChipLookup = "D" | "R" | "I" | "Yea" | "Nay" | "Not Voting";

const CHIP_STYLE_LOOKUP: Record<ChipLookup, ChipStyle> = {
  D: "dem",
  R: "rep",
  I: "ind",
  Yea: "yea",
  Nay: "nay",
  "Not Voting": "dnv",
};

const NORMALIZED_LABELS: Record<string, string> = {
  D: "Democrat",
  R: "Republican",
  I: "Independent",
};

type PageProps = {
  data: NominationVotes[];
  title: string;
  id: string;
};

const NominationDetail = ({ data, title, id }: PageProps) => {
  const [sortType, setSortType] = useState<"party" | "position">("party");
  const [slicedData, setSlicedData] = useState<
    Record<string, NominationVotes[]>
  >({});

  useEffect(() => {
    if (!data) return;
    const _slicedData = data.reduce<Record<string, NominationVotes[]>>((acc, curr) => {
      if (!(curr[sortType]! in acc)) {
        acc[curr[sortType]!] = [];
      }
      acc[curr[sortType]!].push(curr);

      return acc;
    }, {});
    setSlicedData(_slicedData);
  }, [sortType, data]);

  return (
    <>
      <PageHeader title={`Nomination # ${id}`} subtitle={title} />

      <p className="text-center">
        <Link href="/nominations">
          <FontAwesomeIcon icon={faAnglesLeft} className="fa fa-fw"/> Back to Nomination List
        </Link>
      </p>

      <section className="flex flex-col gap-2">
        <VoteStackedBarChart data={data} groupBy={sortType} />

        <div className="mt-5 flex flex-row gap-4 lg:max-w-[768px] m-auto">
          <button
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:bg-gray-100"
            onClick={() => setSortType("party")}
            disabled={sortType === "party"}
          >
            Group by Party
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:bg-gray-100"
            onClick={() => setSortType("position")}
            disabled={sortType === "position"}
          >
            Group by Position
          </button>
        </div>
        <div className="mt-5 lg:w-[768px] m-auto flex flex-col gap-4">
          {Object.keys(slicedData).map((sliceKey) => (
            <section key={sliceKey} className="mb-2">
              <h2 className="text-center text-xl font-bold">
                {NORMALIZED_LABELS[sliceKey] || sliceKey}
              </h2>
              <div className="flex flex-row flex-wrap gap-4 mt-2">
                {slicedData[sliceKey].map((vote) => {
                  let style: ChipStyle;
                  switch (sortType) {
                    case "party":
                      style = CHIP_STYLE_LOOKUP[vote.position! as ChipLookup];
                      break;
                    case "position":
                      style = CHIP_STYLE_LOOKUP[vote.party as ChipLookup];
                  }
                  return (
                    <Chip
                      key={vote.legislatorId}
                      href={`/legislator/${vote.legislatorId}`}
                      style={style}
                    >
                      {vote.name} ({vote.party}, {vote.state})
                    </Chip>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
};

export default NominationDetail;
