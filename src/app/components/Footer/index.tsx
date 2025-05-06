import Link from "next/link";
import { lastUpdateDate } from "@/server/actions/lastUpdate";

export const Footer: React.FC = async () => {
  const updateDate = await lastUpdateDate();

  return (
    <footer className="sticky bottom-0 bg-gray-100 shadow-inner dark:bg-gray-700 dark:text-white flex flex-row justify-end sm:justify-between gap-2 px-10 py-2">
      <p>Last data fetch: {updateDate?.split("+")[0]}</p>
      <div className="text-center items-center gap-2 flex flex-row justify-end">
        &copy; 2025 CoffeeTech.{" "}
        <Link
          className="underline"
          href="/about#cookie-policy"
          rel="noopener noreferer"
        >
          Cookie Policy
        </Link>
      </div>
    </footer>
  );
}