import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { nominationVoteIds } from "@/db/queries/nominations";

export default async function NominationsPage() {
  const voteIdsResponse = await nominationVoteIds;

  const parseNomineeName = (title: string): string => {
    const matches = [...title.matchAll(/^(.+), (of|in).*/gm)];
    if (matches.length) {
      return matches[0][1].trim();
    }
    return "Unknown";
  };

  return (
    <>
      <PageHeader title="Nominations" />

      <section className="flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <p>
          There have been <strong>{voteIdsResponse.length}</strong> nominations
          in the 119th Congress so far.
        </p>
        <p>
          Nominations in the Senate tend to reflect the prevailing attitude
          towards bipartsanship. If the attitude is positive towards
          bipartisanship, the vote distribution will generally be skewed towards
          the nominee, with the minority party joining the majority party. But
          if the atmosphere is heavily partisan, you are more likely to see
          stronger party-line votes for the nominees.
        </p>
        <p>
          This page shows the distribution of votes for each nominee. The
          distribution is shown as a stacked bar chart, one bar per nominee. The
          chart is also shown in the same order in which the votes were taken,
          which can potentially highlight shifts in attitude towards the majority
          party.
        </p>
        <p>
          Click on a nomination vote to display the details of how each Senator
          voted.
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
