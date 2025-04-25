import Page from "./page";
import { Metadata } from "next";
import {
  fetchNominationTitle,
  fetchNominationVotes,
} from "@/server/actions/nominations";

type Props = {
  params: Promise<{ id: string }>
}

const WrappedPage = async ({ params }: Props) => {
  const { id } = await params;

  // Get the data for the page server-side because why not.
  const data = await fetchNominationVotes(id);
  const title = await fetchNominationTitle(id);

  return <Page data={data} title={title} id={id} />;
};

export default WrappedPage;

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { id } = await params;
  const title = await fetchNominationTitle(id);

  return {
    title: `Senate Nomination ${id}`,
    description: `Details for Senate vote ${id}`,
    openGraph: {
      title: `Senate Nomation ${id}`,
      description: title,
      url: `https://cta.us/nominations/${id}`,
    },
  };
};