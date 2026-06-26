"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  getListDiariesQueryKey,
  useDeleteDiary,
  useListDiaries,
} from "@/app/api/generated/diaries/diaries";
import { useAccessToken } from "@/app/auth";
import {
  AdminDiaryList,
  DiaryLoadingStatus,
} from "@/app/features/diary/components";

const ADMIN_PAGE_SIZE = 50;

export default function AdminPage() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const queryClient = useQueryClient();
  const hasToken = Boolean(useAccessToken());
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const listParams = {
    date: date === "" ? undefined : date,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  };

  const diariesQuery = useListDiaries(
    listParams,
    { query: { enabled: hasToken } },
  );
  const deleteMutation = useDeleteDiary({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: getListDiariesQueryKey(listParams),
        }),
    },
  });

  if (!hasToken) {
    return (
      <section className="content-stack">
        <h1>{t("title")}</h1>
        <p className="status-message">{t("protectedMessage")}</p>
        <Link className="button-link" href="/login">
          {tAuth("submit")}
        </Link>
      </section>
    );
  }

  if (diariesQuery.isLoading) {
    return <DiaryLoadingStatus />;
  }

  return (
    <AdminDiaryList
      date={date}
      diaries={diariesQuery.data?.diaries ?? []}
      errorMessage={
        diariesQuery.isError || deleteMutation.isError ? t("deleteFailed") : undefined
      }
      isDeleting={deleteMutation.isPending}
      onDateSearch={(nextDate) => {
        setDate(nextDate);
        setPage(1);
      }}
      onDelete={(id) => deleteMutation.mutate({ id })}
      onPageChange={setPage}
      page={page}
      pageSize={ADMIN_PAGE_SIZE}
      totalCount={diariesQuery.data?.totalCount ?? 0}
    />
  );
}
