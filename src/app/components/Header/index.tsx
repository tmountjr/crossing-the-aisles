"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Announcement } from "@/exports/metadata";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle, faBell } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export const menuLinks = [
  { url: "/", name: "Home" },
  { url: "/nominations", name: "Senate Nominations" },
  { url: "/about", name: "About This Site" },
];

const Header: React.FC<{ announcements: Announcement[] }> = ({
  announcements = [],
}) => {
  const [aOpen, setAOpen] = useState(false);

  const pathname = usePathname();
  const firstLevel = `/${pathname.split("/")[1]}`;

  const filteredAnnouncements = announcements.filter(
    (x) => x.expires >= Date.now()
  );

  return (
    <header className="sticky top-0 bg-white shadow-md z-10 dark:bg-gray-600 dark:text-white px-2 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex flex-row items-center gap-2">
          <FontAwesomeIcon icon={faShuffle} className="fa-fw fa-2xl" />
          <span className="text-lg hidden md:inline-block">
            Crossing the Aisles
          </span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            {menuLinks.map((linkObject, index) => (
              <li
                key={index}
                className={`hover:underline cursor-pointer ${
                  firstLevel === linkObject.url ? "font-bold" : ""
                }`}
              >
                <Link href={linkObject.url}>{linkObject.name}</Link>
              </li>
            ))}
            <li className="relative">
              <button
                className="relative flex items-center justify-center w-10 h10 rounded-full"
                onClick={() => setAOpen(!aOpen)}
              >
                <FontAwesomeIcon icon={faBell} className="fa fa-fw text-xl" />
                {filteredAnnouncements.length > 0 && <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
              </button>

              {aOpen && (
                <ul className="absolute top-6 right-0 mt-2 w-80 bg-white dark:bg-gray-700 shadow-lg rounded-md overflow-hidden border-gray-200 dark:border-gray-600 text-left">
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((announcement, index) => (
                      <li
                        key={index}
                        className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm ${
                          index !== filteredAnnouncements.length - 1
                            ? "border-b border-gray-300 dark:border-gray-600"
                            : ""
                        }`}
                        onClick={() => setAOpen(false)}
                      >
                        <p>
                          <strong>{announcement.title}</strong>
                        </p>
                        <p className="mb-1">
                          <em>{new Date(announcement.date).toISOString().split("T")[0]}</em>
                        </p>
                        <p>{announcement.description}</p>
                        {announcement.link && (
                          <Link
                            className="underline block mt-1"
                            href={announcement.link}
                            rel="noopener noreferrer"
                          >
                            Read More
                          </Link>
                        )}
                      </li>
                    ))
                  ) : (
                    <li
                      className="px-4 py-2 text-gray-500"
                      onClick={() => setAOpen(false)}
                    >
                      No announcements.
                    </li>
                  )}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
