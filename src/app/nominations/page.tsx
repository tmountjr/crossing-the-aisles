import Chip from "@/app/components/Chip";
import PageHeader from "@/app/components/PageHeader";
import { nominationVoteIds } from "@/db/queries/nominations";

export default async function NominationsPage() {
  const voteIdsResponse = (await nominationVoteIds).slice().reverse();

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

      <section className="mt-20 flex flex-col gap-4 lg:max-w-[768px] m-auto">
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
          which can potentially highlight shifts in attitude towards the
          majority party.
        </p>
        <p>
          Click on a nomination vote to display the details of how each Senator
          voted. The list is sorted so that the latest vote shows up first.
        </p>

        <div className="mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {voteIdsResponse.map((voteObject) => (
            <Chip
              key={voteObject.voteId}
              href={`/nominations/${voteObject.voteId}`}
              style="rep"
            >
              <h2 className="text-xl font-bold">
                {parseNomineeName(voteObject.title!)}
              </h2>
              <h3 className="text-md text-gray-700 italic">
                Date: {voteObject.date?.split(" ")[0]}
              </h3>
              <p className="text-lg mt-4">Result: {voteObject.result}</p>
            </Chip>
          ))}
        </div>
      </section>
    </>
  );
}
