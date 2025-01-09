"use client";

import { FC, Suspense } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { isAddress } from "viem";

import { VaultDetails } from "../[address]/components/VaultDetails";
import Loading from "../[address]/loading";

const Gauge: FC = () => {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  if (!address || !isAddress(address)) {
    return notFound();
  }
  return <VaultDetails address={address} />;
};

export default function GaugeStaticPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Gauge />
    </Suspense>
  );
}
