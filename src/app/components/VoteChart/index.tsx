"use client";

import type { BrokePartyLinesData } from "@/db/queries/partyline";
import { Bar } from "react-chartjs-2";
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Reducer {
  labels: string[];
  normalizedValues: number[];
  backgroundColors: string[];
}

const ITEMS_PER_PAGE = 5;

const VoteChart: React.FC<{ data: BrokePartyLinesData[] }> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  
  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => setCurrentTheme(e.matches ? "dark" : "light"));
  }, []);

  const colorScheme = {
    light: { D: "blue", R: "red", I: "gray", grid: { x: "#ddd", y: "#ccc" } },
    dark: { D: "#4a90e2", R: "#e74c3c", I: "a0a0a0", grid: { x: "#555", y: "#444" } },
  };

  const startIndex = page * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const { labels, normalizedValues, backgroundColors } =
    paginatedData.reduce<Reducer>(
      (acc, curr) => {
        acc.labels.push(
          `${curr.name} - ${curr.brokePartyLineCount} / ${curr.totalVoteCount}`
        );
        acc.normalizedValues.push(
          (curr.brokePartyLineCount / curr.totalVoteCount) * 100
        );
        acc.backgroundColors.push(colorScheme[currentTheme][curr.party?.toUpperCase()]);

        return acc;
      },
      {
        labels: [],
        normalizedValues: [],
        backgroundColors: [],
      }
    );

  const chartData = {
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
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const, // Horizontal bar chart
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: colorScheme[currentTheme].grid.x },
      },
      y: {
        grid: { color: colorScheme[currentTheme].grid.y },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full h-[750px]">
      <div className="mt-20 text-center flex flex-row justify-start items-center gap-10">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 hover:bg-sky-500 hover:text-white dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 dark:hover:bg-sky-500 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          disabled={startIndex + ITEMS_PER_PAGE >= data.length}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-950 border border-gray-300 hover:bg-sky-500 hover:text-white dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600 dark:hover:bg-sky-500 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <span>Currently viewing page {page + 1} of {Math.ceil(data.length / ITEMS_PER_PAGE)}.</span>
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default VoteChart;
