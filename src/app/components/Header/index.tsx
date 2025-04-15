"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const menuLinks = [
  { url: "/", name: "Home" },
  { url: "/nominations", name: "Senate Nominations" },
  { url: "/about", name: "About This Site" },
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const firstLevel = `/${pathname.split("/")[1]}`;

  return (
    <header className="sticky top-0 bg-white shadow-md z-10 dark:bg-gray-600 dark:text-white py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex flex-row items-center gap-2">
          <FontAwesomeIcon icon={faShuffle} className="fa-fw fa-2xl" />
          <span className="text-lg">Crossing Party Lines</span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            {menuLinks.map((linkObject, index) => (
              <li key={index} className={`hover:underline cursor-pointer ${firstLevel === linkObject.url ? "font-bold" : ""}`}>
                <Link href={linkObject.url}>{linkObject.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
