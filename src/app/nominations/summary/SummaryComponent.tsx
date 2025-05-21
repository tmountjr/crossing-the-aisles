"use client";

import { draw } from "patternomaly";
import { Bar } from "react-chartjs-2";
import { useColorScheme } from "@/exports/colors";
import type { ChartData, ChartOptions } from "chart.js";
import type { nomPLV } from "@/db/queries/partylineFull";
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
import NavButton from "@/app/components/NavButton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface SummaryComponentProps {
  votes: nomPLV;
}

const ITEMS_PER_PAGE = 10;

const SummaryComponent = ({ votes }: SummaryComponentProps) => {
  const colorScheme = useColorScheme();
  const [page, setPage] = useState(0);
  const [displayData, setDisplayData] = useState<ChartData<"bar">>();

  const recordCount = votes.length;

  useEffect(() => {
    const startIndex = page * ITEMS_PER_PAGE;
    const paginatedData = votes.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    const chartData: ChartData<"bar"> = {
      labels: paginatedData.map((voteRecord) => {
        const title = voteRecord.enriched_vote_meta.nominationTitle || "";
        return title.substring(0, title?.indexOf(","));
      }),
      datasets: [
        {
          label: "Democrat Party Line Votes",
          data: paginatedData.map(
            ({ votes_grouped_by_party_with_party_line: v }) =>
              v.demPartyLineCount || 0
          ),
          backgroundColor: colorScheme.D,
        },
        {
          label: "Democrat Non Party Line Votes",
          data: paginatedData.map(
            ({ votes_grouped_by_party_with_party_line: v }) =>
              v.demNotPartyLineCount || 0
          ),
          backgroundColor: draw("zigzag-vertical", colorScheme.D, "white", 15),
          borderColor: "black",
          borderWidth: 1,
        },
        {
          label: "Republican Non Party Line Votes",
          data: paginatedData.map(
            ({ votes_grouped_by_party_with_party_line: v }) =>
              v.repNotPartyLineCount || 0
          ),
          backgroundColor: draw("zigzag-vertical", colorScheme.R, "white", 15),
          borderColor: "black",
          borderWidth: 1,
        },
        {
          label: "Republican Party Line Votes",
          data: paginatedData.map(
            ({ votes_grouped_by_party_with_party_line: v }) =>
              v.repPartyLineCount || 0
          ),
          backgroundColor: colorScheme.R,
        },
      ],
    };

    setDisplayData(chartData);

    ChartJS.defaults.color = colorScheme.legendColor;
  }, [page, votes, colorScheme]);

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
      {displayData && (
        <>
          <div className="mt-4 text-center flex flex-row justify-start items-center gap-4 lg:gap-10">
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
          <div className="mt-10 h-[750px] lg:h-[500px]">
            <Bar data={displayData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryComponent;
