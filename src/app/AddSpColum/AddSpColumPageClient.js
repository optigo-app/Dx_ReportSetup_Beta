"use client";

import { Suspense, useEffect, useState } from "react";
import AddSpColum from "@/Components/Pages/AddSpList/AddSpColum/AddSpColum";

export default function AddSpColumPageClient() {
  const [sp, setSp] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("editSpData");
      if (raw) setSp(JSON.parse(raw)?.sp || null);
    } catch {
      setSp(null);
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddSpColum sp={sp} />
    </Suspense>
  );
}
