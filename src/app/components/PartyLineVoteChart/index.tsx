"use client";

import { draw } from "patternomaly";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/exports/colors";
import NavButton from "@/app/components/NavButton";
import type { PLVote } from "@/server/actions/bills";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PLVChartProps {
  votes: PLVote[];
  labels: string[];
  usePagination?: boolean;
  itemsPerPage?: number;
}

interface Reducer {
  raw: number[];
  normalized: number[];
}

const DEFAULT_ITEMS_PER_PAGE = 10;

const DEFAULT_CHART_DATA: ChartData<"bar"> = {
  labels: [],
  datasets: [],
};

const PartyLineVoteChart: React.FC<PLVChartProps> = ({
  votes,
  labels,
  usePagination = true,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}) => {
  const colorScheme = useColorScheme();

  // Support for pagination.
  const [page, setPage] = useState(0);
  const [displayData, setDisplayData] =
    useState<ChartData<"bar">>(DEFAULT_CHART_DATA);
  const [datasets, setDatasets] = useState<Reducer[]>([]);

  const recordCount = votes.length;

  useEffect(() => {
    let paginatedData: PLVote[];
    let paginatedLabels: string[];

    if (usePagination) {
      const startIndex = page * itemsPerPage;
      paginatedData = votes.slice(startIndex, startIndex + itemsPerPage);
      paginatedLabels = labels.slice(startIndex, startIndex + itemsPerPage);
    } else {
      paginatedData = votes;
      paginatedLabels = labels;
    }

    const datasets = paginatedData.reduce<Reducer[]>(
      (acc, curr) => {
        const pl = curr.votes_grouped_by_party_with_party_line;

        const demPartyLineCount = Number(pl?.demPartyLineCount || 0);
        const demNotPartyLineCount = Number(pl?.demNotPartyLineCount || 0);
        const repNotPartyLineCount = Number(pl?.repNotPartyLineCount || 0);
        const repPartyLineCount = Number(pl?.repPartyLineCount || 0);
        const totalVotes =
          demPartyLineCount +
          demNotPartyLineCount +
          repNotPartyLineCount +
          repPartyLineCount;

        acc[0].raw.push(demPartyLineCount);
        acc[1].raw.push(demNotPartyLineCount);
        acc[2].raw.push(repNotPartyLineCount);
        acc[3].raw.push(repPartyLineCount);

        acc[0].normalized.push((demPartyLineCount / totalVotes) * 100);
        acc[1].normalized.push((demNotPartyLineCount / totalVotes) * 100);
        acc[2].normalized.push((repNotPartyLineCount / totalVotes) * 100);
        acc[3].normalized.push((repPartyLineCount / totalVotes) * 100);

        return acc;
      },
      [
        { raw: [], normalized: [] },
        { raw: [], normalized: [] },
        { raw: [], normalized: [] },
        { raw: [], normalized: [] },
      ]
    );

    setDatasets(datasets);

    const chartData: ChartData<"bar"> = {
      labels: paginatedLabels,
      datasets: [
        {
          label: "Democrat Party Line Votes",
          data: datasets[0].normalized,
          backgroundColor: colorScheme.D,
        },
        {
          label: "Democrat Non Party Line Votes",
          data: datasets[1].normalized,
          backgroundColor: draw("zigzag-vertical", colorScheme.D, "white", 15),
          borderColor: "black",
          borderWidth: 1,
        },
        {
          label: "Republican Non Party Line Votes",
          data: datasets[2].normalized,
          backgroundColor: draw("zigzag-vertical", colorScheme.R, "white", 15),
          borderColor: "black",
          borderWidth: 1,
        },
        {
          label: "Republican Party Line Votes",
          data: datasets[3].normalized,
          backgroundColor: colorScheme.R,
        },
      ],
    };

    setDisplayData(chartData);

    ChartJS.defaults.color = colorScheme.legendColor;
  }, [itemsPerPage, votes, page, usePagination, labels, colorScheme]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        grid: { color: "#f0f0f0" },
        stacked: true,
        beginAtZero: true,
        max: 100,
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

            const raw = datasets[datasetIndex].raw[index] || 0;
            const normalized = datasets[datasetIndex].normalized[index] || 0;

            return `${datasetLabel}: ${raw} (${normalized.toFixed(2)}%)`;
          },
        },
      },
    },
  };

  // Dynamically decide on the height of the chart area.
  let heightOptions = "h-[300px] lg:h-[400px]";
  const heightCheck = usePagination ? itemsPerPage : votes.length;

  if (heightCheck > 5) {
    heightOptions = "h-[400px] lg:h-[600px]";
  }
  if (heightCheck > 10) {
    heightOptions = "h-[600px] lg:h-[800px]";
  }
  if (heightCheck > 15) {
    heightOptions = "h-[800px] lg:h-[1000px]";
  }
  if (heightCheck > 20) {
    heightOptions = "h-[1000px] lg:h-[1200px]";
  }

  return (
    <div className="w-full">
      {usePagination && (
        <div className="mt-4 text-center flex flex-row justify-start items-center gap-4 lg:gap-10">
          <NavButton
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            direction="previous"
          />
          <NavButton
            disabled={page * itemsPerPage + itemsPerPage >= recordCount}
            onClick={() => setPage(page + 1)}
            direction="next"
          />
          <span>
            Currently viewing page {page + 1} of{" "}
            {Math.ceil(recordCount / itemsPerPage)}.
          </span>
        </div>
      )}
      <div className={`mt-10 ${heightOptions}`}>
        <Bar data={displayData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PartyLineVoteChart;
