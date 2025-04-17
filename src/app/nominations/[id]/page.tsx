import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import {
  lawmakerVotesByNomination,
  nominationTitle,
  type NominationVotes
} from "@/db/queries/nominations";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [dVotes, rVotes, otherVotes] = await Promise.all([
    lawmakerVotesByNomination(id, "d"),
    lawmakerVotesByNomination(id, "r"),
    lawmakerVotesByNomination(id, "other"),
  ]);

  const { title } = (await nominationTitle(id))[0];

  // Internal component to make the display a little cleaner
  type ReduceReturnType = {
    [key: string]: NominationVotes[];
  }
  const partyTable = (party: string, votes: NominationVotes[]) => {
    const grouped = votes.reduce<ReduceReturnType>(
      (acc, curr) => {
        const position =
          curr.position && (curr.position === "Yea" || curr.position === "Nay")
            ? curr.position.toLowerCase()
            : "unknown";

        acc[position].push(curr);
        return acc;
      },
      { yea: [], nay: [], unknown: [] }
    );

    const partyName =
      party === "d"
        ? "Democratic Party"
        : party === "r"
          ? "Republican Party"
          : "Other";

    return (
      <div className="flex flex-col p-4 border-1">
        <div className="grid grid-cols-3 gap-2">
          {/* top row */}
          <h2 className="col-span-3 text-center text-xl font-bold">
            {partyName}
          </h2>

          {/* second row */}
          <h3 className="font-bold">Yea ({grouped.yea.length})</h3>
          <h3 className="font-bold">Nay ({grouped.nay.length})</h3>
          <h3 className="font-bold">Other ({grouped.unknown.length})</h3>

          {/* third row */}
          <div className="flex flex-col gap-2">
            {grouped.yea.map((v) => (
              <p key={v.legislatorId}>
                {v.name} ({v.state})
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {grouped.nay.map((v) => (
              <p key={v.legislatorId}>
                {v.name} ({v.state})
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {grouped.unknown.map((v) => (
              <p key={v.legislatorId}>
                {v.name} ({v.state}) voted &quot;{v.position}&quot;
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader title={`Nomination #${id}`} subtitle={title!} />
      <p className="text-center">
        <Link href="/nominations">Back to Nomination List</Link>
      </p>
      <section className="flex flex-col xl:flex-row gap-2 ">
        {partyTable("d", dVotes)}
        {partyTable("r", rVotes)}
        {partyTable("other", otherVotes)}
      </section>
    </>
  );
}
