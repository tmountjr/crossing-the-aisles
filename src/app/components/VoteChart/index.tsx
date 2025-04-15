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

// ChartJS.register({
//   id: "customLabels",
//   afterDraw: (chart) => {
//     const ctx = chart.ctx;
//     const xySize = 70;

//     chart.data.labels?.forEach((label, index) => {
//       const image = new Image();
//       image.src = "https://avatar.iran.liara.run/public"; // Placeholder avatar
//       const yPos = chart.scales.y.getPixelForValue(index);
//       const barEndX = chart.scales.x.getPixelForValue(chart.data.datasets[0].data[index]);
//       let avatarX = barEndX - xySize - 30;
//       if (avatarX < 200) avatarX = 200; // Ensure it doesn't go off the canvas

//       ctx.drawImage(image, avatarX, yPos - xySize / 2, xySize, xySize); // Adjust positioning
//       ctx.beginPath();
//       ctx.arc(avatarX + xySize / 2, yPos, xySize / 2, 0, Math.PI * 2);
//       ctx.stroke();


//       // // TODO: Test drawing rounded rectangle mask around squared images instead of circles
//       // ctx.save(); // Save state before clipping
//       // ctx.beginPath();
//       // ctx.moveTo(avatarX + cornerRadius, yPos - xyHeight / 2);
//       // ctx.lineTo(avatarX + xyWidth - cornerRadius, yPos - xyHeight / 2);
//       // ctx.arcTo(avatarX + xyWidth, yPos - xyHeight / 2, avatarX + xyWidth, yPos + xyHeight / 2, cornerRadius);
//       // ctx.lineTo(avatarX + xyWidth, yPos + xyHeight / 2 - cornerRadius);
//       // ctx.arcTo(avatarX + xyWidth, yPos + xyHeight / 2, avatarX + xyWidth - cornerRadius, yPos + xyHeight / 2, cornerRadius);
//       // ctx.lineTo(avatarX + cornerRadius, yPos + xyHeight / 2);
//       // ctx.arcTo(avatarX, yPos + xyHeight / 2, avatarX, yPos + xyHeight / 2 - cornerRadius, cornerRadius);
//       // ctx.lineTo(avatarX, yPos - xyHeight / 2 + cornerRadius);
//       // ctx.arcTo(avatarX, yPos - xyHeight / 2, avatarX + cornerRadius, yPos - xyHeight / 2, cornerRadius);
//       // ctx.clip(); // Clip the avatar image to the rounded rect

//       // // Draw image inside clipped area
//       // ctx.drawImage(image, avatarX, yPos - xyHeight / 2, xyWidth, xyHeight);

//       // ctx.restore(); // Restore state after clipping
//     });
//   },
// });

const getPartyColors = () => {
  const docStyle = window.getComputedStyle(window.document.body);
  return {
    D: docStyle.getPropertyValue("--dem"),
    R: docStyle.getPropertyValue("--rep"),
    I: docStyle.getPropertyValue("--ind"),
  };
};


interface Reducer {
  labels: string[];
  normalizedValues: number[];
  backgroundColors: string[];
}

const ITEMS_PER_PAGE = 5;

const VoteChart: React.FC<{ data: BrokePartyLinesData[] }> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [partyColors, setPartyColors] = useState<Record<string, string>>(getPartyColors());
  
  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        // Update the state based on the new theme.
        setCurrentTheme(e.matches ? "dark" : "light");

        // Update the chart colors from the global CSS variables.
        // See: @/app/global.css
        const colors = getPartyColors();
        setPartyColors(colors);
      });
  }, []);


  const colorScheme = {
    light: {
      grid: { x: "#ddd", y: "#ccc" },
    },
    dark: {
      grid: { x: "#555", y: "#444" },
    },
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
        acc.backgroundColors.push(partyColors[curr.party]);
        
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
        ticks: { display: true },
        grid: { color: colorScheme[currentTheme].grid.y },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        xAlign: "left" as const,
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
