import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PartyLineVoteChart from "@/app/components/PartyLineVoteChart";
import { fetchNominationPartyLineVoteCount } from "@/server/actions/brokePartyLinesFull";

const NominationSummaryPage = async () => {
  const partyLineVotes = await fetchNominationPartyLineVoteCount();

  const labels = partyLineVotes.map(({ enriched_vote_meta: v }) => {
    const title = v.nominationTitle || "";
    return title.substring(0, title.indexOf(","));
  });

  return (
    <>
      <PageHeader title="Nomination Bi-Partisan Analysis" />

      <p className="text-center">
        <Link href="/nominations">
          <FontAwesomeIcon icon={faAnglesLeft} className="fa fa-fw" /> Back to
          Nomination List
        </Link>
      </p>

      <section className="mt-20 flex flex-col gap-4 lg:max-w-[768px] m-auto">
        <p>
          Senate nominations are some of the simplest and yet most contentious
          votes taken by Congress. The majority party in the Senate brings the
          President&apos;s nominations to the floor, and the senators vote. A
          simple majority (51 votes) is require to pass a nomination. In the
          event of a tie, the Vice President casts the deciding vote.
        </p>
        <p>
          In a congress where the President&apos;s party also controls the
          Senate, it is rare for a nomination to be rejected. In a highly
          partisan environment, oftentimes the minority party can simply vote
          down on every nominee as a symbolic rejection of the majority
          party&apos;s choice, because the majority party generally has enough
          votes to confirm any nominee. In a more bi-partisan environment, one
          would expect to see a higher number of minority senators voting for
          the majority party&apos;s nominations.
        </p>
        <p>
          The below chart lists all of the Senate nominations to date, showing
          the breakdown of how many legislators from each party crossed party
          lines and voted in a bi-partisan way.
        </p>
      </section>

      <section>
        <PartyLineVoteChart votes={partyLineVotes} labels={labels} />
      </section>
    </>
  );
};

export default NominationSummaryPage;
