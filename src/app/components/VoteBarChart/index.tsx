"use client";

import { Bar } from "react-chartjs-2";
import NavButton from "@/app/components/NavButton";
import React, { useEffect, useState } from "react";
import type { ChartData, ChartOptions } from "chart.js";
import { fetchBplData } from "@/server/actions/brokePartyLines";
import type {
  BrokePartyLinesData,
  BrokePartyLinesFilters,
} from "@/db/queries/partyline";
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ITEMS_PER_PAGE = 5;

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
  const [colorScheme, setColorScheme] = useState<Record<string, string>>({});
  const [displayOptions, setDisplayOptions] = useState<ChartOptions<"bar">>();

  const updateColors = () => {
    const docStyle = window.getComputedStyle(window.document.body);
    const scheme = {
      D: docStyle.getPropertyValue("--dem"),
      R: docStyle.getPropertyValue("--rep"),
      I: docStyle.getPropertyValue("--ind"),
      gridX: docStyle.getPropertyValue("--grid-x"),
      gridY: docStyle.getPropertyValue("--grid-y"),
    };
    setColorScheme(scheme);
  };

  // Run an effect once on initial page load.
  useEffect(() => {
    // First update the colors on page load.
    updateColors();

    // Then set a window callback to do it anytime it changes later.
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => updateColors());
  }, []);

  // Run an effect when the filters change.
  useEffect(() => {
    fetchBplData({ state, chamber, party, legislatorIds }).then(
      (filteredData) => {
        setBplData(filteredData);
        setRecordCount(filteredData.length);
        setPage(0);
      }
    );
  }, [state, chamber, party, legislatorIds]);

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
          acc.normalizedValues.push(
            (curr.brokePartyLineCount / curr.totalVoteCount) * 100
          );
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
  }, [page, bplData, colorScheme]);

  return (
    <div className="w-full">
      <div className="mt-10 lg:mt-20 lg:max-w-[768px] m-auto">
        <h2 className="text-center text-xl font-bold">Explanation</h2>
        <p className="mt-2">
          Each bar on this chart represents the percentage of votes where the
          legislator crossed party lines. A more detailed description of the
          methodology can be found <Link href="/about">here</Link>, but to put
          it simply, a vote is considered a &quot;party line&quot; vote when the
          lawmaker <strong>does not vote &quot;Nay&quot;</strong> on a bill
          advanced by their own party,{" "}
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
          <div className="mt-4 text-center flex flex-row justify-start items-center gap-10">
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
            <span>
              Currently viewing page {page + 1} of{" "}
              {Math.ceil(recordCount / ITEMS_PER_PAGE)}.
            </span>
          </div>
          <div className="h-[750px]">
            <Bar data={displayData} options={displayOptions}></Bar>
          </div>
        </>
      )}
    </div>
  );
};

export default VoteBarChart;
