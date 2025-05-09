"use client";

import { draw } from "patternomaly";
import { Bar } from "react-chartjs-2";
import { useColorScheme } from "@/exports/colors";
import type { ChartData, ChartOptions } from "chart.js";
import ChartjsPluginStacked100 from "chartjs-plugin-stacked100";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { VM, EVM } from "@/server/actions/bills";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartjsPluginStacked100
);

interface BillBarChartProps {
  voteMeta: VM[];
}

const BillBarChart: React.FC<BillBarChartProps> = ({ voteMeta }) => {
  const colorScheme = useColorScheme();

  const labelMaker = (vm: EVM): string => {
    const { category, chamber } = vm;
    let s = `${category} (${chamber})`;
    if (vm.amendmentId) {
      s += `, ${vm.amendmentId}`;
    }
    return s;
  };

  const chartData: ChartData<"bar"> = {
    labels: voteMeta.map(({ enriched_vote_meta }) =>
      labelMaker(enriched_vote_meta)
    ),
    datasets: [
      {
        label: "Democrat Party Line Votes",
        data: voteMeta.map(
          ({ votes_grouped_by_party_with_party_line: v }) =>
            v?.demPartyLineCount || 0
        ),
        backgroundColor: colorScheme.D,
      },
      {
        label: "Democrat Non Party Line Votes",
        data: voteMeta.map(
          ({ votes_grouped_by_party_with_party_line: v }) =>
            v?.demNotPartyLineCount || 0
        ),
        backgroundColor: draw('zigzag-vertical', colorScheme.D, "white", 15),
        borderColor: "black",
        borderWidth: 1,
      },
      {
        label: "Republican Non Party Line Votes",
        data: voteMeta.map(
          ({ votes_grouped_by_party_with_party_line: v }) =>
            v?.repNotPartyLineCount || 0
        ),
        backgroundColor: draw('zigzag-vertical', colorScheme.R, "white", 15),
        borderColor: "black",
        borderWidth: 1,
      },
      {
        label: "Republican Party Line Votes",
        data: voteMeta.map(
          ({ votes_grouped_by_party_with_party_line: v }) =>
            v?.repPartyLineCount || 0
        ),
        backgroundColor: colorScheme.R,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        grid: { color: "#f0f0f0" },
        stacked: true,
        beginAtZero: true,
      },
      y: {
        grid: { color: "#f0f0f0" },
        stacked: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const data = tooltipItem.chart.data;
            const datasetIndex = tooltipItem.datasetIndex;
            const index = tooltipItem.dataIndex;
            const datasetLabel = data.datasets[datasetIndex].label || "";
            const originalValue = data.originalData
              ? data.originalData[datasetIndex][index]
              : "N/A";
            const rateValue = data.calculatedData
              ? data.calculatedData[datasetIndex][index]
              : "N/A";
            return `${datasetLabel}: ${originalValue} (${rateValue}%)`;
          },
        },
      },
      stacked100: {
        enable: true,
        replaceTooltipLabel: false,
      },
    },
  };

  // Dynamically decide on the height of the chart area.
  let heightOptions = "h-[300px] lg:h-[400px]";
  
  if (voteMeta.length > 5) {
    heightOptions = "h-[400px] lg:h-[600px]";
  }
  if (voteMeta.length > 10) {
    heightOptions = "h-[600px] lg:h-[800px]";
  }
  if (voteMeta.length > 15) {
    heightOptions = "h-[800px] lg:h-[1000px]";
  }
  if (voteMeta.length > 20) {
    heightOptions = "h-[1000px] lg:h-[1200px]";
  }

  return (
    <div className="w-full">
      <div className={`mt-10 ${heightOptions}`}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BillBarChart;
