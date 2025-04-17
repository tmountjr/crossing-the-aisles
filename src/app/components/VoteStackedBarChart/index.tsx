"use client";

import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { type NominationVotes } from "@/db/queries/nominations";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const NORMALIZED_LABELS: Record<string, string> = {
  D: "Democrat",
  R: "Republican",
  I: "Independent",
};

interface VoteDonutChartProps {
  data: NominationVotes[];
  groupBy?: "party" | "position";
}

const VoteStackedBarChart: React.FC<VoteDonutChartProps> = ({
  data,
  groupBy = "party",
}) => {
  // const [displayData, setDisplayData] = useState<ChartData<"doughnut">>();
  const [colorScheme, setColorScheme] = useState<Record<string, string>>({});

  const updateColors = () => {
    const docStyle = window.getComputedStyle(window.document.body);
    const scheme = {
      D: docStyle.getPropertyValue("--dem"),
      R: docStyle.getPropertyValue("--rep"),
      I: docStyle.getPropertyValue("--ind"),
      Yea: docStyle.getPropertyValue("--color-yea"),
      Nay: docStyle.getPropertyValue("--color-nay"),
      "Not Voting": docStyle.getPropertyValue("--color-dnv"),
      gridX: docStyle.getPropertyValue("--grid-x"),
      gridY: docStyle.getPropertyValue("--grid-y"),
    };
    setColorScheme(scheme);
  };

  // Run effect when page loads.
  useEffect(() => {
    updateColors();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => updateColors());
  }, []);

  // The filters (changing the primary grouping) really only change which dataset comes first in the
  // pie chart. So we can pre-compute them once as non-state items.
  let grouped: Record<string, Record<string, NominationVotes[]>>;
  const levelTwoLabels = new Set<string>();

  if (groupBy === "party") {
    grouped = data.reduce<typeof grouped>((acc, curr) => {
      if (!acc[curr.party]) {
        acc[curr.party] = {};
      }
      if (!acc[curr.party][curr.position!]) {
        acc[curr.party][curr.position!] = [];
        levelTwoLabels.add(curr.position!);
      }
      acc[curr.party][curr.position!].push(curr);

      return acc;
    }, {});
  } else {
    grouped = data.reduce<typeof grouped>((acc, curr) => {
      if (!acc[curr.position!]) {
        acc[curr.position!] = {};
      }
      if (!acc[curr.position!][curr.party]) {
        acc[curr.position!][curr.party] = [];
        levelTwoLabels.add(curr.party);
      }
      acc[curr.position!][curr.party].push(curr);

      return acc;
    }, {});
  }

  const displayData: ChartData<"bar"> = {
    labels: Object.keys(grouped).map(
      (levelOneLabel) => NORMALIZED_LABELS[levelOneLabel] || levelOneLabel
    ),
    datasets: [...levelTwoLabels].map((levelTwoLabel) => ({
      label: NORMALIZED_LABELS[levelTwoLabel] || levelTwoLabel,
      data: Object.keys(grouped).map((levelOneLabel) => {
        if (grouped[levelOneLabel][levelTwoLabel]) {
          return grouped[levelOneLabel][levelTwoLabel].length;
        }
        return 0;
      }),
      backgroundColor: colorScheme[levelTwoLabel],
      borderColor: "white",
      borderWidth: 1,
    })),
  };

  const displayOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        grid: { color: colorScheme.gridX },
        stacked: true,
        beginAtZero: true,
      },
      y: {
        grid: { color: colorScheme.gridY },
        stacked: true,
      },
    },
  };

  return (
    <div className="w-full">
      <div className="mt-10 lg:mt-20 lg:max-w-[768px] m-auto">
        <h2 className="text-center text-xl font-bold">Explanation</h2>
        {groupBy === "party" && (
          <p className="mt-2">
            Each bar on this chart represents the total number of votes from
            each party. Within each bar, the three different colors represent
            the number of votes cast by vote type.
          </p>
        )}
        {groupBy === "position" && (
          <p className="mt-2">
            Each bar on this chart represents the total number of votes cast by
            vote type. Within each bar, the three different colors represent the
            count of that vote type cast by each party.
          </p>
        )}
        <p className="mt-2">
          By default the chart is sorted by party. To change the sorting, use the
          filter below the chart.
        </p>
      </div>

      {displayData && (
        <div className="h-[300px] lg:h-[400px]">
          <Bar data={displayData} options={displayOptions} />
        </div>
      )}
    </div>
  );
};

export default VoteStackedBarChart;
