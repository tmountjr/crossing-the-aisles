import Page from "./page";
import { Metadata } from "next";
import { states } from "@/exports/states";
import { fetchLegislator } from "@/server/actions/legislators";
import { fetchVotesByLegislator } from "@/server/actions/brokePartyLines";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WrappedPage({ params }: Props) {
  const { id } = await params;

  const legislator = await fetchLegislator(id);
  const votesByLegislator = await fetchVotesByLegislator(id);

  let fullParty = "Other";
  if (legislator.party === "R") {
    fullParty = "Republican";
  } else if (legislator.party === "D") {
    fullParty = "Democratic";
  } else if (legislator.party === "I") {
    fullParty = "Independent";
  }

  const shortTitle =
    legislator.termType === "sen" ? "Senator" : "Representative";

  const homeState =
    states.find((s) => s.code === legislator.state)?.name || "Unknown";

  return (
    <Page
      legislator={legislator}
      votes={votesByLegislator}
      fullParty={fullParty}
      shortTitle={shortTitle}
      homeState={homeState}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const legislator = await fetchLegislator(id);

  return {
    title: legislator.name,
    description: `Details for ${legislator.name}, ${legislator.party}-${legislator.state}`,
    openGraph: {
      title: legislator.name,
      description: `Legislator details for ${legislator.name}, ${legislator.party}-${legislator.state}, including party line vote breakdown${legislator.termType === "sen" ? " as well as a breakdown of party line voting on Nominations" : ""}.`,
      url: `https://cta.us/legislator/${id}`,
      type: "profile",
    },
  };
}
