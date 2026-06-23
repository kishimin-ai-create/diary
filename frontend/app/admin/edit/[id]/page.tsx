"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  useGetDiary,
  useUpdateDiary,
} from "@/app/api/generated/diaries/diaries";
import { useAccessToken } from "@/app/auth";
import { DiaryEditorForm } from "@/app/features/diary/components";

export default function EditDiaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tDiary = useTranslations("diary");
  const hasToken = Boolean(useAccessToken());
  const diaryQuery = useGetDiary(params.id, { query: { enabled: hasToken } });
  const updateMutation = useUpdateDiary({
    mutation: {
      onSuccess: () => router.push("/admin"),
    },
  });

  if (!hasToken) {
    return (
      <section className="content-stack">
        <h1>{t("formEditTitle")}</h1>
        <p className="status-message">{t("protectedMessage")}</p>
        <Link className="button-link" href="/login">
          {tAuth("submit")}
        </Link>
      </section>
    );
  }

  if (diaryQuery.isLoading) {
    return <p className="status-message">{tDiary("loading")}</p>;
  }

  if (diaryQuery.isError || !diaryQuery.data) {
    return <p className="status-message error">{t("saveFailed")}</p>;
  }

  return (
    <DiaryEditorForm
      errorMessage={updateMutation.isError ? t("saveFailed") : undefined}
      initialDiary={diaryQuery.data}
      isPending={updateMutation.isPending}
      mode="edit"
      onSubmit={(values) => updateMutation.mutate({ id: params.id, data: values })}
    />
  );
}
