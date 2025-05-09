import Link from "next/link";
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

  console.log(voteMeta);

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
            There were {voteMeta.length} roll call votes on this bill in total.
          </p>
        </section>

        {vmA.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Amendments</h2>
            <p>
              There were {vmA.length} amendments to this bill that received a
              roll call vote.
            </p>
            {/* {vmA.length > 0 && (
              <ul>
                {vmA.map((vm) => (
                  <li key={vm.amendments?.amendmentId}>
                    <p>-- {vm.amendments?.purpose}</p>
                  </li>
                ))}
              </ul>
            )} */}
          </section>
        )}

        {/*
          TODO: vote bar chart(s). For each vote, the bar should be in four chunks:
            leftmost chunk: democratic party line vote count
            left middle chunk: democratic non-party line vote count
            right middle chunk: republican non-party line vote count
            rightmost chunk: republican party line vote count

          party line vote chunks (outermost) should be solid colors.
          non-party line vote chunks should have the same color but with stripes
            (see https://www.chartjs.org/docs/latest/general/colors.html#patterns-and-gradients)
            (see also https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern)

          The bar chart component will be passed voteMeta assuming we can join
          the vote counts as well. Might also see if we can precompute the
          datasets necessary serverside rather than clientside and just pass
          the resulting datasets over to the client component directly. That
          way the client component doesn't have to calculate anything, it just
          draws what it's given.
        */}

      </section>
    </>
  );
}
