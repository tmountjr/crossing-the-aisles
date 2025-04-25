"use client";

import "./page.css";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import { states } from "@/exports/states";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useColorScheme } from "@/exports/colors";
import PageHeader from "@/app/components/PageHeader";
import type { ChartData, ChartOptions } from "chart.js";
import Chip, { ChipStyle } from "@/app/components/Chip";
import { VoteWithPartyLine } from "@/db/queries/partyline";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type PartyLineGroups = {
  isPartyLine: VoteWithPartyLine[];
  isAbstain: VoteWithPartyLine[];
  isNotPartyLine: VoteWithPartyLine[];
};

const groupVotes = (v: VoteWithPartyLine[]): PartyLineGroups =>
  v.reduce<PartyLineGroups>(
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

type PartyLineColorScheme = Record<keyof PartyLineGroups, string>;

const defaultChartData = {
  labels: ["Votes"],
  datasets: [],
};

const Page = () => {
  const [legislator, setLegislator] = useState<Legislator>();
  const [votes, setVotes] = useState<VoteWithPartyLine[]>([]);
  const [legislatorPLScheme, setLegislatorPLScheme] =
    useState<PartyLineColorScheme>();
  const [allVotesChartData, setAllVotesChartData] =
    useState<ChartData<"bar">>(defaultChartData);
  const [nomVotesChartData, setNomVotesChartData] =
    useState<ChartData<"bar">>(defaultChartData);
  const [shortTitle, setShortTitle] = useState<string>();
  const [homeState, setHomeState] = useState<string>();
  const [fullParty, setFullParty] = useState<string>();
  const [allVotePartyLineCount, setAllVotePartyLineCount] = useState(0);
  const [nomVotePartyLineCount, setnomVotePartyLineCount] = useState(0);
  const [totalNomVote, setTotalNomVote] = useState(0);

  const { id } = useParams();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchData = async (id: string) => {
      const _legislator = await fetchLegislator(id);
      const _votesByLegislator = await fetchVotesByLegislator(id);
      setLegislator(_legislator);
      setVotes(_votesByLegislator);

      switch (_legislator.party) {
        case "R":
          setFullParty("Republican");
          break;
        case "D":
          setFullParty("Democratic");
          break;
        case "I":
          setFullParty("Independent");
          break;
        default:
          setFullParty("Other");
      }

      setShortTitle(
        _legislator.termType === "sen" ? "Senator" : "Representative"
      );
      setHomeState(states.find((s) => s.code === _legislator.state)?.name);

      const _legislatorPLScheme: PartyLineColorScheme = {
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

  // Once the votes have been set, we can calculate the chart data.
  useEffect(() => {
    if (!legislator || !legislatorPLScheme) return;

    const allVoteData: ChartData<"bar"> = {
      labels: ["Votes"],
      datasets: [],
    };

    const groupedVotes = groupVotes(votes);
    setAllVotePartyLineCount(groupedVotes.isPartyLine.length);

    allVoteData.datasets = [
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

    setAllVotesChartData(allVoteData);

    if (legislator.termType === "sen") {
      const nomVoteData: ChartData<"bar"> = {
        labels: ["Votes"],
        datasets: [],
      };

      const nomVotes = votes.filter((v) => v.category === "nomination");
      const groupedVotes = groupVotes(nomVotes);
      setnomVotePartyLineCount(groupedVotes.isPartyLine.length);
      setTotalNomVote(nomVotes.length);

      nomVoteData.datasets = [
        {
          label: "Party Line",
          data: [groupedVotes.isPartyLine.length],
          backgroundColor: [legislatorPLScheme?.isPartyLine],
          borderColor: "white",
          borderWidth: 1,
        },
        {
          label: "Not Party Line",
          data: [groupedVotes.isNotPartyLine.length],
          backgroundColor: [legislatorPLScheme?.isNotPartyLine],
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

      setNomVotesChartData(nomVoteData);
    }
  }, [votes, legislator, legislatorPLScheme]);

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
      if (legislator?.caucus === "D") return "dem";
      if (legislator?.caucus === "R") return "rep";
    }
    if (legislator?.caucus === "D") return "rep";
    if (legislator?.caucus === "R") return "dem";
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
            {fullParty} {shortTitle}
          </strong>{" "}
          from {homeState}
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
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">All Votes</h3>
          <p>
            {legislator.name} has cast <strong>{votes.length}</strong> votes in
            the current session of Congress. We calculate that{" "}
            <strong>{allVotePartyLineCount}</strong> were party-line votes. This
            equates to{" "}
            <strong>
              {Math.floor((allVotePartyLineCount / votes.length) * 100)}%
            </strong>
            of the total votes cast by this legislator.
          </p>
          {Object.keys(allVotesChartData).length > 0 && (
            <div className="h-[100px] lg:h-[200px]">
              <Bar data={allVotesChartData} options={displayOptions} />
            </div>
          )}
        </section>

        {legislator.termType === "sen" && (
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Nomination Votes</h3>
            <p>
              {legislator.name} has cast <strong>{totalNomVote}</strong> votes
              for nominees in the current session of Congress. We calculate that{" "}
              <strong>{nomVotePartyLineCount}</strong> were party-line votes.
              This equates to{" "}
              <strong>
                {Math.floor((nomVotePartyLineCount / totalNomVote) * 100)}%
              </strong>{" "}
              of the total nomination votes cast by this legislator.
            </p>
            {Object.keys(nomVotesChartData).length > 0 && (
              <div className="h-[100px] lg:h-[200px]">
                <Bar data={nomVotesChartData} options={displayOptions} />
              </div>
            )}
            <div className="mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
              {votes
                .filter((v) => v.category === "nomination")
                .map((vote) => (
                  <Chip
                    key={vote.voteId}
                    href={`/nominations/${vote.voteId}`}
                    style={getChipDisplayOption(vote)}
                  >
                    {vote.nominationTitle}
                  </Chip>
                ))}
            </div>
          </section>
        )}
      </section>
    </>
  ) : (
    <p>Loading...</p>
  );
};

export default Page;
