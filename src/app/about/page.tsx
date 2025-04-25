import "./page.css";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CTA",
  description: "About page for Crossing the Aisles",
  openGraph: {
    title: "About CTA",
    description: "About page for Crossing the Aisles",
  }
}

export default function Page() {
  return (
    <>
      <PageHeader title="About This Site" />

      <section className="mt-20 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Our Mission</h2>
        <p>
          Our mission is to provide a comprehensive and accurate resource for
          information about the United States Congress. We strive to make it
          easy for people to find and understand who their elected officials
          are, what they stand for, and how they vote on important issues.
        </p>
        <p>
          To achieve this mission, we gather information from a variety of
          sources, including official government websites, news outlets, and
          other reliable sources. We then organize and present this information
          in an easy-to-use format that is accessible to everyone.
        </p>
        <p>
          The metrics we have chosen to focus on for this site are{" "}
          <strong>party-line votes</strong>. We believe that these votes provide
          valuable insight into the positions of individual legislators and
          their alignment with their political party. By providing a detailed
          breakdown of each legislator&apos;s voting record, we hope to help
          people better understand the political landscape in Washington D.C.
        </p>
      </section>
      <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">
          What is a &quot;party-line vote&quot;?
        </h2>
        <p>
          Understanding how we summarize the data on this site is key to
          understanding how we present information about legislators. Here we
          define a <strong>party-line vote</strong> for any individual lawmaker
          as a vote that satisfies one of two conditions:
        </p>
        <ul className="flex flex-col gap-2">
          <li className="ml-10">
            The legislator&apos;s vote on a bill put forward by their own party{" "}
            <strong>was not</strong> &quot;Nay&quot;, OR
          </li>
          <li className="ml-10">
            The legislator&apos;s vote on a bill put forward by the opposition
            party <strong>was not</strong> &quot;Yea&quot;.
          </li>
        </ul>
        <h3 className="text-lg font-bold">What kind of votes are tracked?</h3>
        <p>
          For the purposes of this site, not all votes are created equal. For
          example, as of April 17, 2025, the House has held 102 roll call votes,
          and the Senate has held 213 roll call votes. This is not the total
          number of votes that have been taken in Congress, however. A{" "}
          <strong>roll call vote</strong> is a vote where individual lawmakers
          are called by name, one by one, and prompted to enter their vote on
          the bill at hand. Not all votes in Congress are roll call votes, and
          those that are not are not tracked here.
        </p>
        <p>
          Furthermore, this site is not tracking every roll call vote. In the
          lifetime of a bill, multiple roll call votes can be taken on the bill
          before it is passed to the next stage of becoming law. One of the
          reasons we do not summarize even all roll call votes is because some
          votes, like a <em>motion to recommit</em>, generally see the
          opposition party voting &quot;yea&quot; and the sponsoring party
          voting &quot;nay&quot; on a bill that they would otherwise vote the
          other way around. An example of this was two back-to-back votes on{" "}
          <a
            href="https://www.govtrack.us/congress/bills/119/hr22"
            target="_blank"
            rel="noopener noreferrer"
          >
            H.R.22: SAVE Act
          </a>
          . The final vote on this bill (sponsored by{" "}
          <Link href="/legislator/R000614">Chip Roy, R, TX-21</Link>) saw high
          levels of Republican support, but the previous vote on this bill
          (which was the motion to recommit) saw unanimous Democratic support
          and unanimous Republican opposition.
        </p>
        <p>
          For now, this site only tracks the latest vote on any given bill, and
          applies the logic above to each vote to determine if it would be
          considered a party-line vote or not.
        </p>
      </section>

      <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Why focus on party-line votes?</h2>
        <p>
          Your level of partisanship plays a significant role in how you
          perceive the political process. For one who is hyper-partisan, you
          would likely prefer to see most, if not all, votes be party-line
          votes; you want your party to be unified either in support of or in
          opposition to the will of the opposing party. However, for someone who
          is less partisan, you may be more interested in seeing a mix of votes,
          as it may reflect more of a willingness to work together despite
          ideological differences.
        </p>
        <p>
          Ultimately this site does not try to explicitly take a position on
          partisanship either way, for or against. Both the partisan and the
          non-partisan, the Democrat and the Republican, are welcome to look at
          this data and draw their own conclusions.
        </p>
      </section>

      <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Data Caveats</h2>
        <p>There are a few caveats to be aware of when looking at this data:</p>
        <ol className="flex flex-col gap-2">
          <li className="ml-10">
            <strong>Not all votes are shown.</strong> Because there can be (and
            often are) more than one vote for each issue under consideration,
            and the logic for what is and is not a &quot;party line vote&quot;
            can flip depending on the kind of vote, we have made the decision
            only to display the most recent vote on any given matter.{" "}
            <strong>Why it matters:</strong> The percentage of party line votes
            we display for a legislator may be higher or lower than in reality
            when all &quot;internal&quot; votes on a bill are taken into
            account. However, in a selection of test cases, this did not seem to
            push any of legislators over the 50% line from a &quot;not party
            line&quot; to a &quot;party line&quot; legislator.
          </li>
          <li className="ml-10">
            <strong>Independent legislators:</strong> Independent legislators
            are currently rare, but when they do appear, for the purposes of
            deciding whether a given vote is a party-line vote, we use the party
            they caucus with as a substitute for their party. Hence why a
            legislator like Bernie Sanders will have party line votes that align
            with Democratic Party goals, even though he is not registered with
            the Democratic Party.
          </li>
          <li className="ml-10">
            <strong>Nominations:</strong> Nominations are not considered
            &quot;bills&quot; in the upstream data source we use, and as a
            result votes on nominations do not come with a &quot;sponsor
            party&quot;. In these cases, we use the majority party as the
            &quot;sponsor party&quot; when determining whether a vote on a
            nomination is a party-line vote.
          </li>
        </ol>
      </section>

      <section className="mt-4 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <h2 className="text-xl font-bold">Data Sources and Acknowledgements</h2>
        <p>
          The data powering this site comes primarily from{" "}
          <a
            href="https://github.com/unitedstates/congress"
            target="_blank"
            rel="noopener noreferrer"
          >
            the @unitedstates/congress
          </a>{" "}
          repository, from{" "}
          <a
            href="https://unitedstates.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            the @unitedstates project
          </a>
          . This open-source collection of tools scrapes several official
          Congressional websites on a daily basis to retrieve bill and vote
          information. We have taken additional steps to further normalize some
          of this data and load it into a database format that supports querying
          and more in-depth searching. Specifically, we pull{" "}
          <strong>Vote</strong>, <strong>Bill</strong>, and{" "}
          <strong>Legislator</strong> datasets daily and integrate them into the
          database, where this web app can query it to generate the information
          you see throughout the site.
        </p>
        <p>
          If you see data that you believe is misleading or incorrect, please
          feel free to <a href="#">create an issue</a> on the Github repository
          for this site. Most likely, inaccuracies you may find here are a
          result of incorrect querying or summarizing, rather than incorrect
          upstream data, but filing an issue will help us troubleshoot all the
          same.
        </p>
      </section>
    </>
  );
}
