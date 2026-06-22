"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useCreateDiary } from "@/app/api/generated/diaries/diaries";
import { DiaryEditorForm } from "@/app/features/diary/components";

export default function CreateDiaryPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const createMutation = useCreateDiary({
    mutation: {
      onSuccess: () => router.push("/admin"),
    },
  });

  return (
    <DiaryEditorForm
      errorMessage={createMutation.isError ? t("saveFailed") : undefined}
      isPending={createMutation.isPending}
      mode="create"
      onSubmit={(values) => createMutation.mutate({ data: values })}
    />
  );
}
