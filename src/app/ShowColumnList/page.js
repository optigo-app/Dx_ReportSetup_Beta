export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ShowColumnList from "../../Components/Pages/EntryForm/ShowColumnList/ShowColumnList";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShowColumnList />
    </Suspense>
  );
}