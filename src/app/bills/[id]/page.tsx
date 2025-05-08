import PageHeader from "@/app/components/PageHeader";
import { billInformation, voteMetaForBill } from "@/db/queries/bills";

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
    voteMetaForBill(id),
    billInformation(id),
  ]);

  // Break out the amendments to their own object.
  const vmA = voteMeta.filter((vm) => vm.amendments);
  let subtitle = billInfo.title;
  if (billInfo.shortTitle) {
    subtitle += `(aka ${billInfo.shortTitle})`;
  }

  return (
    <>
      <PageHeader
        title={`Bill information for ${billInfo.billId}`}
        subtitle={subtitle}
      />
      <p>There were {voteMeta.length} roll call votes on this bill in total.</p>
      <p>
        This bill <strong>{vmA.length > 0 ? "has" : "does not have"}</strong>{" "}
        amendments.
      </p>
      {vmA.length > 0 && (
        <p>
          There are {vmA.length} amendments to this bill that received a roll
          call vote.
        </p>
      )}

      {vmA.length > 0 && (
        <ul>
          {vmA.map((vm) => (
            <li key={vm.amendments?.amendmentId}>
              <p>
                Amendment ID: {vm.amendments?.amendmentId}:{" "}
                {vm.amendments?.purpose}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
