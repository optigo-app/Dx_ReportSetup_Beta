export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AddReport from "@/Components/Pages/EntryForm/AddReport/AddReport";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddReport />
    </Suspense>
  );
}