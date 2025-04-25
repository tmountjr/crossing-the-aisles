import { Metadata } from "next";
import { states } from "@/exports/states";
import LegislatorDetail from "./LegislatorDetail";
import { VoteWithPartyLine } from "@/db/queries/partyline";
import { fetchVotesByLegislator } from "@/server/actions/brokePartyLines";
import { fetchLegislator, type Legislator } from "@/server/actions/legislators";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const legislator = await fetchLegislator(id);

  return {
    title: legislator.name,
    description: `Details for ${legislator.name}, ${legislator.party}-${legislator.state}`,
    openGraph: {
      title: legislator.name,
      description: `Legislator details for ${legislator.name}, ${
        legislator.party
      }-${legislator.state}, including party line vote breakdown${
        legislator.termType === "sen"
          ? " as well as a breakdown of party line voting on Nominations"
          : ""
      }.`,
      url: `${process.env.DOMAIN}/legislator/${id}`,
      type: "profile",
    },
  };
};

export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = await props.params;
  const id = params.id;

  const legislator: Legislator = await fetchLegislator(id);
  const votesByLegislator: VoteWithPartyLine[] = await fetchVotesByLegislator(
    id
  );

  let fullParty = "Other";
  if (legislator.party === "R") {
    fullParty = "Republican";
  } else if (legislator.party === "D") {
    fullParty = "Democratic";
  } else if (legislator.party === "I") {
    fullParty = "Independent";
  }

  const shortTitle: string =
    legislator.termType === "sen" ? "Senator" : "Representative";

  const homeState =
    states.find((s) => s.code === legislator.state)?.name || "Unknown";

  return (
    <LegislatorDetail
      legislator={legislator}
      votes={votesByLegislator}
      fullParty={fullParty}
      shortTitle={shortTitle}
      homeState={homeState}
    />
  );
};
