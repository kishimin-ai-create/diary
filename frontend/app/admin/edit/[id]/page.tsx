"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  useGetDiary,
  useUpdateDiary,
} from "@/app/api/generated/diaries/diaries";
import { DiaryEditorForm } from "@/app/features/diary/components";

export default function EditDiaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("admin");
  const tDiary = useTranslations("diary");
  const diaryQuery = useGetDiary(params.id);
  const updateMutation = useUpdateDiary({
    mutation: {
      onSuccess: () => router.push("/admin"),
    },
  });

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
