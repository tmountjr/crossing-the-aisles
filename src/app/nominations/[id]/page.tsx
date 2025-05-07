import { Metadata } from "next";
import NominationDetail from "./NominationDetail";
import {
  fetchNominationTitle,
  fetchNominationVotes,
} from "@/server/actions/nominations";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export const revalidate = 3600; // 1h

export async function generateMetadata(props: {
  params: Params
  searchParams: SearchParams
}): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const title = await fetchNominationTitle(id);

  return {
    metadataBase: new URL(process.env.DOMAIN!),
    title: `Senate Nomination ${id}`,
    description: `Details for Senate vote ${id}`,
    openGraph: {
      title: `Senate Nomation ${id}`,
      description: title,
      url: `${process.env.DOMAIN}/nominations/${id}`,
      type: "website",
      siteName: "Crossing the Aisles",
    },
  };
};

// Make the page a server component to use different metadata tags.
export default async function Page(props: {
  params: Params
  searchParams: SearchParams
}) {
  const params = await props.params;
  const { id } = params;

  // Get the data for the page server-side because why not.
  const data = await fetchNominationVotes(id);
  const title = await fetchNominationTitle(id);

  return <NominationDetail data={data} title={title} id={id} />;
};
