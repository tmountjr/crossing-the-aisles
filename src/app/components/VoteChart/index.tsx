"use client";

import type {
  BrokePartyLinesData,
} from "@/db/queries/partyline";
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

const VoteChart: React.FC<{ data: BrokePartyLinesData[] }> = ({ data }) => {
  const { labels, normalizedValues, backgroundColors } = data.reduce<Reducer>((acc, curr) => {
    acc.labels.push(`${curr.name} - ${curr.brokePartyLineCount} / ${curr.totalVoteCount}`);
    acc.normalizedValues.push((curr.brokePartyLineCount / curr.totalVoteCount) * 100);

    let bgColor;
    if (curr.party === "D") {
      bgColor = "blue";
    } else if (curr.party === "R") {
      bgColor = "red";
    } else {
      bgColor = "gray";
    }
    acc.backgroundColors.push(bgColor)

    return acc;
  }, {
    labels: [],
    normalizedValues: [],
    backgroundColors: []
  });

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
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "750px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default VoteChart;
