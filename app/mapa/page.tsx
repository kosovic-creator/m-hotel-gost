"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function MapPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen pt-24 px-4 pb-8">
      <div className="w-full max-w-4xl space-y-4">
        <div>
          <Button variant="outline" asChild>
            <Link href="/">Nazad na pocetnu</Link>
          </Button>
        </div>
        <div className="w-full bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <Map posix={[42.37502101208353, 19.252633449195127]} />
        </div>
      </div>
    </main>
  );
}
