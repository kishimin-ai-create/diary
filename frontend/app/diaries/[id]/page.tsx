"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useGetDiary } from "@/app/api/generated/diaries/diaries";
import {
  DiaryDetailView,
  DiaryLoadingStatus,
} from "@/app/features/diary/components";

export default function DiaryDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("diary");
  const diaryQuery = useGetDiary(params.id);

  if (diaryQuery.isLoading) {
    return <DiaryLoadingStatus />;
  }

  if (diaryQuery.isError || !diaryQuery.data) {
    return (
      <section className="content-stack">
        <p className="status-message error">{t("notFound")}</p>
        <Link className="inline-link" href="/">
          {t("detailBack")}
        </Link>
      </section>
    );
  }

  return <DiaryDetailView diary={diaryQuery.data} />;
}
