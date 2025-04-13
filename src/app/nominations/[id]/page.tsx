import PageHeader from "@/app/components/PageHeader";
import { lawmakerVotesByNomination } from "@/db/queries/nominations";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const votes = (await lawmakerVotesByNomination(id)).reduce(
    (acc, curr) => {
      const position = curr.position && (curr.position == "Yea" || curr.position == "Nay") ? curr.position.toLowerCase() : 'unknown';
      if (curr.party?.toLowerCase() === "d") {
        acc.d[position].push(curr)
      } else if (curr.party?.toLowerCase() === "r") {
        acc.r[position].push(curr);
      } else {
        acc.other[position].push(curr);
      }
      return acc;
    },
    {
      d: { yea: [], nay: [], unknown: [] },
      r: { yea: [], nay: [], unknown: [] },
      other: { yea: [], nay: [], unknown: [] },
    }
  );
  
  return (
    <>
      <PageHeader title={`Nomination #${id}`} />
      <section className="flex flex-row gap-10">
        <div>
          <h2>Democratic Party</h2>
          <div className="flex flex-row gap-10">
            <div className="flex flex-col">
              <h3>Yea</h3>
              {votes.d.yea.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.state})</p>
              ))}
            </div>
            <div className="flex flex-col">
              <h3>Nay</h3>
              {votes.d.nay.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.state})</p>
              ))}
            </div>
            <div className="flex flex-col">
              <h3>Other</h3>
              {votes.d.unknown.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.state}) voted "{v.position}"</p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2>Republican Party</h2>
          <div className="flex flex-row gap-10">
            <div className="flex flex-col">
              <h3>Yea</h3>
              {votes.r.yea.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.state})</p>
              ))}
            </div>
            <div className="flex flex-col">
              <h3>Nay</h3>
              {votes.r.nay.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.state})</p>
              ))}
            </div>
            <div className="flex flex-col">
              <h3>Other</h3>
              {votes.r.unknown.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.state}) voted "{v.position}"</p>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h2>Other</h2>
          <div className="flex flex-row gap-10">
            <div className="flex flex-col">
              <h3>Yea</h3>
              {votes.other.yea.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.party}, {v.state})</p>
              ))}
            </div>
            <div className="flex flex-col">
              <h3>Nay</h3>
              {votes.other.nay.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.party}, {v.state})</p>
              ))}
            </div>
            <div className="flex flex-col">
              <h3>Other</h3>
              {votes.other.unknown.map(v => (
                <p key={v.legislatorId}>{v.name} ({v.party}, {v.state}) voted "{v.position}"</p>
              ))}
            </div>
          </div>
        </div>
        
      </section>
    </>
  )
}
