import OrmTable from "@/app/components/OrmTable";
import PageHeader from "@/app/components/PageHeader";
import { data as tallies } from "@/db/queries/partyline";

export default function Home() {
  return (
    <>
      <PageHeader title="Crossing the Aisle" />

      <section>
        <OrmTable
          title="The last 10 roll call votes, summarized by how many lawmakers from each party crossed party lines."
          data={tallies}
          headers={{
            voteId: "Vote ID",
            billId: "Bill ID",
            date: "Date",
            category: "Category",
            title: "Title",
            rPartyLine: "R Party Line",
            rNotPartyLine: "R Not Party Line",
            dPartyLine: "D Party Line",
            dNotPartyLine: "D Not Party Line",
          }}
        />
      </section>
    </>
  );
}
