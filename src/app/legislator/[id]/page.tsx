"use client";

import "./page.css";
import { states } from "@/app/page";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { fetchLegislator, type Legislator } from "@/server/actions/legislators";

const Page = () => {
  const [legislator, setLegislator] = useState<Legislator>();

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async (id: string) => {
      const _legislator = await fetchLegislator(id);
      setLegislator(_legislator);
      console.log(_legislator);
    };

    if (id) {
      const _id = Array.isArray(id) ? id[0] : id;
      fetchData(_id);
    }
  }, [id]);

  const fullParty = () => {
    if (!legislator) return;
    switch (legislator.party) {
      case "R":
        return "Republican";
      case "D":
        return "Democratic";
      default:
        return "Independent";
    }
  };

  const shortTitle = () => {
    if (!legislator) return;
    return legislator.termType === "sen" ? "Senator" : "Representative";
  };

  const homeState = () => {
    if (!legislator) return;
    return states.find((s) => s.code === legislator.state)?.name;
  };

  return legislator ? (
    <>
      <PageHeader
        title={`${legislator.name!}, ${legislator.party}-${legislator.state}`}
      />

      <section className="mt-20 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <p>
          <strong>{legislator.name}</strong> is a{" "}
          <strong>{fullParty()} {shortTitle()}</strong> from {homeState()}
          {legislator.termType === "rep" &&
            `'s House District ${legislator.district}`}
          .
        </p>
        <h2 className="text-xl font-bold">
          <strong>Quick Links:</strong>
        </h2>
        <ul className="flex flex-col gap-2">
          <li className="ml-10">
            <a
              href={`https://bioguide.congress.gov/search/bio/${legislator.bioguideId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Entry on the Biographical Directory of the United States Congress
            </a>
          </li>
          <li className="ml-10">
            <a
              href={legislator.url!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official Website
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Vote Summary</h2>
        <p className="italic">Coming soon!</p>
      </section>
    </>
  ) : (
    <p>Loading...</p>
  );
};

export default Page;
