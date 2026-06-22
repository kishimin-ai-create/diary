"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  getListDiariesQueryKey,
  useDeleteDiary,
  useListDiaries,
} from "@/app/api/generated/diaries/diaries";
import { useAccessToken } from "@/app/auth";
import { AdminDiaryList } from "@/app/features/diary/components";

const ADMIN_PAGE_SIZE = 50;

export default function AdminPage() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tDiary = useTranslations("diary");
  const queryClient = useQueryClient();
  const hasToken = Boolean(useAccessToken());

  const diariesQuery = useListDiaries(
    { page: 1, pageSize: ADMIN_PAGE_SIZE },
    { query: { enabled: hasToken } },
  );
  const deleteMutation = useDeleteDiary({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: getListDiariesQueryKey({ page: 1, pageSize: ADMIN_PAGE_SIZE }),
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
    return <p className="status-message">{tDiary("loading")}</p>;
  }

  return (
    <AdminDiaryList
      diaries={diariesQuery.data?.diaries ?? []}
      errorMessage={
        diariesQuery.isError || deleteMutation.isError ? t("deleteFailed") : undefined
      }
      isDeleting={deleteMutation.isPending}
      onDelete={(id) => deleteMutation.mutate({ id })}
    />
  );
}
