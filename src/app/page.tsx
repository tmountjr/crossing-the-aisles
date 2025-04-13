import { db } from "@/db";
import { legislators } from "@/db/schema";
import PageHeader from "@/app/components/PageHeader";

export default async function Home() {
  const allLegis = await db.select().from(legislators);

  return (
    <>
      <PageHeader
        title="Welcome to Your App"
        subtitle="Explore features and functionality here."
      />
      <div>
        <ul className="flex flex-col gap-2">
          {allLegis.map((legislator) => (
            <li key={legislator.id}>
              {legislator.name} ({legislator.party}, {legislator.state}
              {legislator.district === "N/A" ? "" : legislator.district})
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
