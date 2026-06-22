import { Suspense } from "react";

import { HomePageClient } from "./home-page-client";
import { messages } from "./i18n/messages";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="status-message">{messages.ja.diary.loading}</p>}>
      <HomePageClient />
    </Suspense>
  );
}
