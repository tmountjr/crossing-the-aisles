import { Metadata } from "next";
import NominationDetail from "./NominationDetail";
import {
  fetchNominationTitle,
  fetchNominationVotes,
} from "@/server/actions/nominations";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
  params: Params
  searchParams: SearchParams
}): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const title = await fetchNominationTitle(id);

  return {
    title: `Senate Nomination ${id}`,
    description: `Details for Senate vote ${id}`,
    openGraph: {
      title: `Senate Nomation ${id}`,
      description: title,
      url: `https://cta.us/nominations/${id}`,
      type: "website",
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
