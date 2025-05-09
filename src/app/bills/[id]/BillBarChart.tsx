"use client";

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
    const { voteId, date } = vm;
    let s = `${voteId} (${date})`;
    if (vm.amendmentId) {
      s += `, Amend. ${vm.amendmentId}`;
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
        backgroundColor: "white",
        borderColor: "black",
        borderRadius: 3,
      },
      {
        label: "Republican Non Party Line Votes",
        data: voteMeta.map(
          ({ votes_grouped_by_party_with_party_line: v }) =>
            v?.repNotPartyLineCount || 0
        ),
        backgroundColor: "white",
        borderColor: "black",
        borderRadius: 3,
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

  return (
    <div className="w-full">
      <div className="mt-10 h-[600px] lg:h-[800px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BillBarChart;
