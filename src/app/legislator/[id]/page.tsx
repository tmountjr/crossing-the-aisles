"use client";

import { useParams } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";

const Page = () => {
  const { id } = useParams();

  return <PageHeader title={`Legislator ${id}`} />
}

export default Page;