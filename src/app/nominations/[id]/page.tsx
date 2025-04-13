import PageHeader from "@/app/components/PageHeader";
import { lawmakerVotesByNomination } from "@/db/queries/nominations";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ dVotes, rVotes, otherVotes ] = await Promise.all([
    lawmakerVotesByNomination(id, 'd'),
    lawmakerVotesByNomination(id, 'r'),
    lawmakerVotesByNomination(id, 'other'),
  ])

  // Internal component to make the display a little cleaner
  const partyTable = (party: string, votes: any[]) => {
    const grouped = votes.reduce((acc, curr) => {
      const position = curr.position && (curr.position === 'Yea' || curr.position === 'Nay')
        ? curr.position.toLowerCase()
        : 'unknown';
      
      acc[position].push(curr)
      return acc
    }, { yea: [], nay: [], unknown: [] })

    const partyName = party === 'd'
      ? 'Democratic Party'
      : party === 'r'
        ? 'Republican Party'
        : 'Other'
    
    return (
      <div className="flex flex-col">
        <h2>{partyName}</h2>
        <div className="flex flex-row gap-10">
          <div className="flex flex-col">
            <h3>Yea</h3>
            {grouped.yea.map((v) => (
              <p key={v.legislatorId}>
                {v.name} ({v.state})
              </p>
            ))}
          </div>
          <div className="flex flex-col">
            <h3>Nay</h3>
            {grouped.nay.map((v) => (
              <p key={v.legislatorId}>
                {v.name} ({v.state})
              </p>
            ))}
          </div>
          <div className="flex flex-col">
            <h3>Other</h3>
            {grouped.unknown.map((v) => (
              <p key={v.legislatorId}>
                {v.name} ({v.state}) voted &quot;{v.position}&quot;
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  };
  
  return (
    <>
      <PageHeader title={`Nomination #${id}`} />
      <section className="flex flex-row gap-10">
        {partyTable('d', dVotes)}
        {partyTable('r', rVotes)}
        {partyTable('other', otherVotes)}
      </section>
    </>
  );
}