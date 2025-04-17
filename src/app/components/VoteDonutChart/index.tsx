"use client";

import { Doughnut } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { type NominationVotes } from "@/db/queries/nominations";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const NORMALIZED_LABELS: Record<string, string> = {
  D: "Democrat",
  R: "Republican",
  I: "Independent",
};

interface Reducer {
  labels: string[];
  values: number[];
  colors: string[];
}

interface VoteDonutChartProps {
  data: NominationVotes[];
  groupBy?: "party" | "position";
}

const VoteDonutChart: React.FC<VoteDonutChartProps> = ({
  data,
  groupBy = "party",
}) => {
  const [groupedData, setGroupedData] =
    useState<Record<string, NominationVotes[]>>();
  const [displayData, setDisplayData] = useState<ChartData<"doughnut">>();
  const [displayOptions, setDisplayOptions] =
    useState<ChartOptions<"doughnut">>();
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

  // Anytime the data or grouping changes, update displayData.
  // The prop should be immutable.
  useEffect(() => {
    // Since "party" and "position" are both keys on each vote, we can group dynamically.
    const _groupedData = data.reduce((acc, curr) => {
      const key = curr[groupBy] as string;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);

      return acc;
    }, {} as Record<string, NominationVotes[]>);

    setGroupedData(_groupedData);
  }, [data, groupBy]);

  // If the display data changes, update the
  useEffect(() => {
    if (!groupedData) return;
    const { labels, values, colors }: Reducer = Object.keys(
      groupedData
    ).reduce<Reducer>(
      (acc, curr) => {
        acc.labels.push(
          curr in NORMALIZED_LABELS ? NORMALIZED_LABELS[curr] : curr
        );
        acc.values.push(groupedData[curr].length);
        acc.colors.push(colorScheme[curr]);

        return acc;
      },
      {
        labels: [],
        values: [],
        colors: [],
      }
    );

    setDisplayData({
      labels,
      datasets: [
        {
          label: `Votes by ${groupBy[0].toUpperCase() + groupBy.slice(1)}`,
          data: values,
          backgroundColor: colors,
          borderColor: "white",
          borderWidth: 1,
        },
      ],
    });

    setDisplayOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
      },
    });
  }, [groupedData, groupBy, colorScheme]);

  return (
    <div className="w-full">
      <div className="mt-20 lg:max-w-[768px] m-auto">
        <h1>hello world</h1>
      </div>

      {displayData && (
        <div className="h-[300px] lg:h-[400px]">
          <Doughnut data={displayData} options={displayOptions} />
        </div>
      )}
    </div>
  );
};

export default VoteDonutChart;
