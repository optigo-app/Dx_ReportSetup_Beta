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
// pm2 list 
// npm i -f
// npm run build && pm2 restart "90099" && pm2 save 

// dxreportsetup.web
// R50B3 : 6007 - 24
// local76 : 6009 - 26

//dxreportseup.optigoapps.com
//R76 : 5016
//R76BETA : 5017

