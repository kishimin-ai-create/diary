"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useCreateDiary } from "@/app/api/generated/diaries/diaries";
import { useAccessToken } from "@/app/auth";
import { DiaryEditorForm } from "@/app/features/diary/components";

export default function CreateDiaryPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const hasToken = Boolean(useAccessToken());
  const createMutation = useCreateDiary({
    mutation: {
      onSuccess: () => router.push("/admin"),
    },
  });

  if (!hasToken) {
    return (
      <section className="content-stack">
        <h1>{t("formCreateTitle")}</h1>
        <p className="status-message">{t("protectedMessage")}</p>
        <Link className="button-link" href="/login">
          {tAuth("submit")}
        </Link>
      </section>
    );
  }

  return (
    <DiaryEditorForm
      errorMessage={createMutation.isError ? t("saveFailed") : undefined}
      isPending={createMutation.isPending}
      mode="create"
      onSubmit={(values) => createMutation.mutate({ data: values })}
    />
  );
}
