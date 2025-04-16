"use client";

import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { fetchBplData } from "@/server/actions/brokePartyLines";
import NavButton from "@/app/components/NavButton";
import React, { useEffect, useState } from "react";
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
    <div className="w-full h-[750px]">
      {displayData && (
        <>
          <div className="mt-20 text-center flex flex-row justify-start items-center gap-10">
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

          <Bar data={displayData} options={displayOptions}></Bar>
        </>
      )}
    </div>
  );
};

export default VoteBarChart;
