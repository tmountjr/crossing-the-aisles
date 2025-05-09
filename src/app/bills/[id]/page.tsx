import Link from "next/link";
import BillBarChart from "./BillBarChart";
import PageHeader from "@/app/components/PageHeader";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchBillInformation, fetchVoteMeta } from "@/server/actions/bills";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export const revalidate = 3600; // 1h

export default async function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const { id } = params;

  const [voteMeta, billInfo] = await Promise.all([
    fetchVoteMeta(id),
    fetchBillInformation(id),
  ]);

  // Break out the amendments to their own object.
  const vmA = voteMeta.filter((vm) => vm.amendments);

  return (
    <>
      <PageHeader title={`Bill Information for ${billInfo.billId}`} />

      <p className="text-center">
        <Link href="/bills">
          <FontAwesomeIcon icon={faAnglesLeft} className="fa fa-fw" /> Back to
          Bill List
        </Link>
      </p>

      <section className="mt-20 flex flex-col gap-8 lg:max-w-[768px] m-auto">
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Long Title</h2>
          <p>{billInfo.title}</p>
        </section>

        {billInfo.shortTitle && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Short Title</h2>
            <p>{billInfo.shortTitle}</p>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Vote Information</h2>
          <p>
            <strong>Status:</strong> {billInfo.status} as of {billInfo.statusAt}
            .
          </p>
          <p>
            <strong>Sponsor:</strong>{" "}
            {billInfo.sponsorName && (
              <>
                This bill was sponsored by{" "}
                <Link
                  className="underline"
                  href={`/legislator/${billInfo.sponsorId}`}
                  rel="noopener noreferrer"
                >
                  {billInfo.sponsorName}
                </Link>{" "}
                ({billInfo.sponsorParty}-{billInfo.sponsorState}).
              </>
            )}
            {!billInfo.sponsorName && (
              <>
                This was a {billInfo.sponsorParty}-sponsored bill not advanced
                by a specific legislator.
              </>
            )}
          </p>
          <p>
            Party line votes are determined based on this being a{" "}
            <strong>{billInfo.sponsorParty}-sponsored</strong> piece of
            legislation. See{" "}
            <Link
              className="underline"
              href="/about#what-is-a-party-line-vote"
              rel="noopener noreferrer"
            >
              here
            </Link>{" "}
            for information on how party line votes are determined.
          </p>
          <p>
            <strong>Vote count:</strong> There were {voteMeta.length} roll call
            votes on this bill in total.
          </p>
        </section>

        {vmA.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Amendments</h2>
            <p>
              There were {vmA.length} amendments to this bill that received a
              roll call vote. The amendments are listed below with their
              sponsors:
            </p>
            <ul className="ml-8">
              {vmA.map((vm) => (
                <li key={vm.amendments?.amendmentId}>
                  -- Amendment <strong>{vm.amendments?.amendmentId}</strong>{" "}
                  filed by{" "}
                  <Link
                    className="underline"
                    href={`/legislator/${vm.amendments?.sponsorId}`}
                    rel="noopener noreferrer"
                  >
                    {vm.enriched_vote_meta.sponsorName} (
                    {vm.enriched_vote_meta.sponsorParty})
                  </Link>{" "}
                  : {vm.amendments?.purpose}
                </li>
              ))}
            </ul>
            <p>
              Party line votes for these amendments are determined based on the
              party of the amendment sponsor, NOT the bill&apos;s sponsor.
            </p>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Vote Distribution</h2>
          <p>
            This chart shows the distribution of party line and non-party line
            votes per party for each roll call vote taken.
          </p>
          <BillBarChart voteMeta={voteMeta} />
        </section>
      </section>
    </>
  );
}
