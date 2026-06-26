import { Suspense } from "react";

import { DiaryLoadingStatus } from "./features/diary/components";
import { HomePageClient } from "./home-page-client";

export default function HomePage() {
  return (
    <Suspense fallback={<DiaryLoadingStatus />}>
      <HomePageClient />
    </Suspense>
  );
}
