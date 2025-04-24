"use client";

import "./page.css";
import { Bar } from "react-chartjs-2";
import { states } from "@/exports/states";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useColorScheme } from "@/exports/colors";
import PageHeader from "@/app/components/PageHeader";
import type { ChartData, ChartOptions } from "chart.js";
import { fetchVotesByLegislator } from "@/server/actions/brokePartyLines";
import { fetchLegislator, type Legislator } from "@/server/actions/legislators";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { VoteWithPartyLine } from "@/db/queries/partyline";
import Link from "next/link";
import Chip, { ChipStyle } from "@/app/components/Chip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Reducer = {
  isPartyLine: VoteWithPartyLine[];
  isAbstain: VoteWithPartyLine[];
  isNotPartyLine: VoteWithPartyLine[];
};

const Page = () => {
  const [legislator, setLegislator] = useState<Legislator>();
  const [votes, setVotes] = useState<VoteWithPartyLine[]>([]);
  const [legislatorPLScheme, setLegislatorPLScheme] = useState<
    Record<string, string>
  >({});

  const { id } = useParams();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchData = async (id: string) => {
      const _legislator = await fetchLegislator(id);
      const _votesByLegislator = await fetchVotesByLegislator(id);
      setLegislator(_legislator);
      setVotes(_votesByLegislator);

      const _legislatorPLScheme: Record<string, string> = {
        isPartyLine:
          _legislator.party === "D" || _legislator.party === "I"
            ? colorScheme.D
            : colorScheme.R,
        isNotPartyLine:
          _legislator.party === "D" || _legislator.party === "I"
            ? colorScheme.R
            : colorScheme.D,
        isAbstain: colorScheme["Not Voting"],
      };
      setLegislatorPLScheme(_legislatorPLScheme);
    };

    if (id) {
      const _id = Array.isArray(id) ? id[0] : id;
      fetchData(_id);
    }
  }, [id, colorScheme]);

  const fullParty = () => {
    if (!legislator) return;
    switch (legislator.party) {
      case "R":
        return "Republican";
      case "D":
        return "Democratic";
      case "I":
        return "Independent";
      default:
        return "Other";
    }
  };

  const shortTitle = () => {
    if (!legislator) return;
    return legislator.termType === "sen" ? "Senator" : "Representative";
  };

  const homeState = () => {
    if (!legislator) return;
    return states.find((s) => s.code === legislator.state)?.name;
  };

  const displayData = () => {
    const data: ChartData<"bar"> = {
      labels: ["Votes"],
      datasets: [],
    };

    if (votes && legislator) {
      const groupedVotes = votes.reduce<Reducer>(
        (acc, curr) => {
          if (curr.isAbstain) {
            acc.isAbstain.push(curr);
          } else {
            if (curr.isPartyLine) {
              acc.isPartyLine.push(curr);
            } else {
              acc.isNotPartyLine.push(curr);
            }
          }
          return acc;
        },
        {
          isPartyLine: [],
          isNotPartyLine: [],
          isAbstain: [],
        }
      );

      data.datasets = [
        {
          label: "Party Line",
          data: [groupedVotes.isPartyLine.length],
          backgroundColor: [legislatorPLScheme.isPartyLine],
          borderColor: "white",
          borderWidth: 1,
        },
        {
          label: "Not Party Line",
          data: [groupedVotes.isNotPartyLine.length],
          backgroundColor: [legislatorPLScheme.isNotPartyLine],
          borderColor: "white",
          borderWidth: 1,
        },
        {
          label: "Not Voting",
          data: [groupedVotes.isAbstain.length],
          backgroundColor: [legislatorPLScheme.isAbstain],
          borderColor: "white",
          borderWidth: 1,
        },
      ];
    }

    return data;
  };

  const nominationDisplayData = () => {
    const data: ChartData<"bar"> = {
      labels: ["Votes"],
      datasets: [],
    };

    if (votes && legislator && legislator.termType === "sen") {
      const nominationVotes = votes.filter((v) => v.category === "nomination");
      const groupedVotes = nominationVotes.reduce<Reducer>(
        (acc, curr) => {
          if (curr.isAbstain) {
            acc.isAbstain.push(curr);
          } else {
            if (curr.isPartyLine) {
              acc.isPartyLine.push(curr);
            } else {
              acc.isNotPartyLine.push(curr);
            }
          }
          return acc;
        },
        {
          isPartyLine: [],
          isNotPartyLine: [],
          isAbstain: [],
        }
      );

      data.datasets = [
        {
          label: "Party Line",
          data: [groupedVotes.isPartyLine.length],
          backgroundColor: [legislatorPLScheme.isPartyLine],
          borderColor: "white",
          borderWidth: 1,
        },
        {
          label: "Not Party Line",
          data: [groupedVotes.isNotPartyLine.length],
          backgroundColor: [legislatorPLScheme.isNotPartyLine],
          borderColor: "white",
          borderWidth: 1,
        },
        {
          label: "Not Voting",
          data: [groupedVotes.isAbstain.length],
          backgroundColor: [legislatorPLScheme.isAbstain],
          borderColor: "white",
          borderWidth: 1,
        },
      ];
    }

    return data;
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

  const getChipDisplayOption = (vote: VoteWithPartyLine): ChipStyle => {
    if (vote.isAbstain) return "dnv";
    if (vote.isPartyLine) {
      if (legislator?.party === "D") return "dem";
      if (legislator?.party === "R") return "rep";
    }
    if (legislator?.party === "D") return "rep";
    if (legislator?.party === "R") return "dem";
    return "dnv";
  };

  return legislator ? (
    <>
      <PageHeader
        title={`${legislator.name!}, ${legislator.party}-${legislator.state}`}
      />

      <section className="mt-20 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <p>
          <strong>{legislator.name}</strong> is a{" "}
          <strong>
            {fullParty()} {shortTitle()}
          </strong>{" "}
          from {homeState()}
          {legislator.termType === "rep" &&
            `'s House District ${legislator.district}`}
          .
        </p>
        <h2 className="text-xl font-bold">
          <strong>Quick Links:</strong>
        </h2>
        <ul className="flex flex-col gap-2">
          <li className="ml-10">
            <a
              href={`https://bioguide.congress.gov/search/bio/${legislator.bioguideId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Entry on the Biographical Directory of the United States Congress
            </a>
          </li>
          <li className="ml-10">
            <a href={legislator.url!} target="_blank" rel="noopener noreferrer">
              Official Website
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Vote Summary</h2>
        <p>
          The chart below shows all the votes cast by this legislator. The bars
          are color-coded by party. Red bars indicate votes cast in support of
          Republican-sponsored legislation or against Democrat-sponsored
          legislation; blue bars indicate the opposite.
        </p>
        <p>
          See{" "}
          <Link href="/about" rel="noreferrer noopener">
            the about page
          </Link>{" "}
          for the methodology we use to determine what is and is not a
          party-line vote.
        </p>
        <h3 className="text-lg font-bold">All Votes</h3>
        <div className="h-[100px] lg:h-[200px]">
          <Bar data={displayData()} options={displayOptions} />
        </div>

        {legislator.termType === "sen" && (
          <>
            <h3 className="text-lg font-bold">Nomination Votes</h3>
            <div className="h-[100px] lg:h-[200px]">
              <Bar data={nominationDisplayData()} options={displayOptions} />
            </div>
          </>
        )}
      </section>

      {/* TODO: We're gonna have to pull in bill information for this section. */}
      {/* <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Vote Details</h2>
        <p>Each vote is shown below, color-coded the same as the chart above.</p>
        <div className="flex flex-row flex-wrap mt-2">
          {votes.map((vote) => (
            <Chip
              key={vote.voteId}
              href="#"
              style={getChipDisplayOption(vote)}
            >
              <strong>{vote.voteId}</strong>
              <p>{vote.position}</p>
            </Chip>
          ))}
        </div>
      </section> */}
    </>
  ) : (
    <p>Loading...</p>
  );
};

export default Page;
