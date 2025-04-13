import PageHeader from "@/app/components/PageHeader";
import { nominationVoteIds } from "@/db/queries/nominations";
import Link from "next/link";

export default async function NominationsPage() {
  const voteIdsResponse = await nominationVoteIds;

  const parseNomineeName = (title: string): string => {
    const matches = [...title.matchAll(/^(.+), (of|in).*/gm)];
    if (matches.length) {
      return matches[0][1].trim();
    }
    return "Unknown";
  }

  return (
    <>
      <PageHeader title="Nominations" />

      <section>
        <p>
          There have been <strong>{voteIdsResponse.length}</strong> nominations
          in the 119th Congress so far.
        </p>
        <ul>
          {voteIdsResponse.map((voteObject) => (
            <li key={voteObject.voteId}>
              <Link href={`/nominations/${voteObject.voteId}`}>
                {voteObject.voteId} - {parseNomineeName(voteObject.title!)} on{" "}
                {voteObject.date!}
              </Link>
            </li>
          ))}
        </ul>
        <p>Click on a link to view the details of that nomination.</p>
      </section>
    </>
  );
}