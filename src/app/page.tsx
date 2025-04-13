import PageHeader from "@/app/components/PageHeader";
import { data as tallies } from "@/db/queries/partyline";

export default async function Home() {
  return (
    <>
      <PageHeader
        title="Welcome to Your App"
        subtitle="Explore features and functionality here."
      />
      <table>
        <thead>
          <tr>
            <th>Vote ID</th>
            <th>Bill ID</th>
            <th>Date</th>
            <th>Category</th>
            <th>Title</th>
            <th>Republican Party Line</th>
            <th>Republican Not Party Line</th>
            <th>Democrat Party Line</th>
            <th>Democrat Not Party Line</th>
          </tr>
        </thead>
        <tbody>
          {tallies.map((vote) => (
            <tr key={vote.voteId}>
              <td>{vote.voteId}</td>
              <td>{vote.billId}</td>
              <td>{vote.date}</td>
              <td>{vote.category}</td>
              <td>{vote.title}</td>
              <td>{vote.rPartyLine}</td>
              <td>{vote.rNotPartyLine}</td>
              <td>{vote.dPartyLine}</td>
              <td>{vote.dNotPartyLine}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
