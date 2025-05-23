"use client";

import { Bar } from "react-chartjs-2";
import { useColorScheme } from "@/exports/colors";
import NavButton from "@/app/components/NavButton";
import React, { useEffect, useState } from "react";
import type { ChartData, ChartOptions } from "chart.js";
import { fetchBplData } from "@/server/actions/brokePartyLinesFull";
import type {
  BrokePartyLinesData,
  BrokePartyLinesFilters,
} from "@/db/queries/partylineFull";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpShortWide, faArrowUpWideShort } from "@fortawesome/free-solid-svg-icons";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ITEMS_PER_PAGE = 10;

interface Reducer {
  labels: string[];
  normalizedValues: number[];
  backgroundColors: string[];
}

const VoteBarChart: React.FC<BrokePartyLinesFilters> = ({
  state,
  chamber,
  party,
  legislatorIds,
}) => {
  const [page, setPage] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [bplData, setBplData] = useState<BrokePartyLinesData[]>([]);
  const [displayData, setDisplayData] = useState<ChartData<"bar">>();
  const [displayOptions, setDisplayOptions] = useState<ChartOptions<"bar">>();
  const [sortOrder, setSortOrder] = useState("desc");

  const colorScheme = useColorScheme();

  // Run an effect when the filters change.
  useEffect(() => {
    fetchBplData({ state, chamber, party, legislatorIds, sortOrder }).then(
      (filteredData) => {
        setBplData(filteredData);
        setRecordCount(filteredData.length);
        setPage(0);
      }
    );
  }, [state, chamber, party, legislatorIds, sortOrder]);

  // Don't re-fetch the data when just the page changes, but do reslice the original
  // data. Also watch the color scheme for changes and rebuild the data and options if it changes.
  useEffect(() => {
    const startIndex = page * ITEMS_PER_PAGE;
    const paginatedData = bplData.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    const { labels, normalizedValues, backgroundColors } =
      paginatedData.reduce<Reducer>(
        (acc, curr) => {
          acc.labels.push(
            `${curr.name} - ${curr.brokePartyLineCount} / ${curr.totalVoteCount}`
          );
          acc.normalizedValues.push(curr.brokePartyLinePercent * 100);
          acc.backgroundColors.push(colorScheme[curr.party]);

          return acc;
        },
        {
          labels: [],
          normalizedValues: [],
          backgroundColors: [],
        }
      );

    setDisplayData({
      labels,
      datasets: [
        {
          label: "Breaks from Party (%)",
          data: normalizedValues,
          backgroundColor: backgroundColors,
          borderColor: "white",
          borderWidth: 1,
        },
      ],
    });

    setDisplayOptions({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y" as const,
      scales: {
        x: {
          min: 0,
          max: 100,
          grid: { color: colorScheme.gridX },
        },
        y: {
          ticks: { display: true },
          grid: { color: colorScheme.gridY },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { xAlign: "left" as const },
      },
    });

    ChartJS.defaults.color = colorScheme.legendColor;
  }, [page, bplData, colorScheme]);

  return (
    <div className="w-full">
      <div className="mt-10 lg:mt-20 lg:max-w-[768px] m-auto">
        <h2 className="text-center text-xl font-bold">Explanation</h2>
        <p className="mt-2">
          Each bar on this chart represents the percentage of votes where the
          legislator crossed party lines. A more detailed description of the
          methodology can be found{" "}
          <Link
            className="underline"
            href="/about#what-is-a-party-line-vote"
            rel="noopener noreferer"
          >
            here
          </Link>
          , but to put it simply, a vote is considered a &quot;party line&quot;
          vote when the lawmaker <strong>does not vote &quot;Nay&quot;</strong>{" "}
          on a bill advanced by their own party,{" "}
          <strong>OR does not vote &quot;Yea&quot;</strong> on a bill advanced
          by the opposition party.
        </p>
        <p className="mt-2">
          Because the chart can in theory mix Senate and House legislators, and
          because not all legislators vote on all issues, the data is shown as a
          normalized percentage of votes cast by that legislator. This ensures
          that the scales between Seantors and Representatives on the same chart
          are an apples-to-apples comparison.
        </p>
      </div>
      {displayData && (
        <>
          <div className="mt-4 text-center flex flex-row justify-start items-center gap-4 lg:gap-10">
            <NavButton
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              direction="previous"
            />
            <NavButton
              disabled={page * ITEMS_PER_PAGE + ITEMS_PER_PAGE >= recordCount}
              onClick={() => setPage(page + 1)}
              direction="next"
            />

            {sortOrder === "desc" && (
              <button
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:bg-gray-100 flex flex-row gap-2 items-center"
                onClick={() => setSortOrder("asc")}
              >
                <FontAwesomeIcon
                  icon={faArrowUpWideShort}
                  className="fa fa-fw"
                />
              </button>
            )}

            {sortOrder === "asc" && (
              <button
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:bg-gray-100 flex flex-row gap-2 items-center"
                onClick={() => setSortOrder("desc")}
              >
                <FontAwesomeIcon
                  icon={faArrowUpShortWide}
                  className="fa fa-fw"
                />
              </button>
            )}
            
            <span>
              Currently viewing page {page + 1} of{" "}
              {Math.ceil(recordCount / ITEMS_PER_PAGE)}.
            </span>
          </div>
          <div className="lg:h-[750px] h-[500px]">
            <Bar data={displayData} options={displayOptions}></Bar>
          </div>
        </>
      )}
    </div>
  );
};

export default VoteBarChart;
