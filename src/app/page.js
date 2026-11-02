export const dynamic = "force-dynamic";

import { Suspense } from "react";
import GridMain from "@/Components/GridMain/GridMain";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GridMain />
    </Suspense>
  );
}

// find . -mindepth 1 -delete

// dxreportsetup.web

// beta : 6007 - 29
// npm run build && pm2 restart 27 && pm2 save 

// dxreportseup.optigoapps.com
// R76 : 5016
// R76BETA : 5017