"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useListDiaries } from "./api/generated/diaries/diaries";
import { DiaryListView } from "./features/diary/components";

const PAGE_SIZE = 10;

/**
 * Renders the searchable diary index using query string state.
 */
export function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = readPositiveNumber(searchParams.get("page"), 1);
  const date = searchParams.get("date") ?? undefined;
  const diariesQuery = useListDiaries({ page, pageSize: PAGE_SIZE, date });

  function updateSearch(nextPage: number, nextDate: string | undefined) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (nextDate) {
      params.set("date", nextDate);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <DiaryListView
      date={date}
      diaries={diariesQuery.data?.diaries ?? []}
      isError={diariesQuery.isError}
      isLoading={diariesQuery.isLoading}
      page={diariesQuery.data?.page ?? page}
      pageSize={diariesQuery.data?.pageSize ?? PAGE_SIZE}
      totalCount={diariesQuery.data?.totalCount ?? 0}
      onDateSearch={(nextDate) => updateSearch(1, nextDate || undefined)}
      onPageChange={(nextPage) => updateSearch(nextPage, date)}
    />
  );
}

function readPositiveNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
