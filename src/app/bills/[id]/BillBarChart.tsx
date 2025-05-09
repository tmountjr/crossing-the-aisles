"use client";

import { Bar } from "react-chartjs-2";
import { useColorScheme } from "@/exports/colors";
import type { ChartData, ChartOptions } from "chart.js";
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
  Legend
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
  };

  return (
    <div className="w-full">
      <div className="mt-10 h-[300px] lg:h-[400px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BillBarChart;
