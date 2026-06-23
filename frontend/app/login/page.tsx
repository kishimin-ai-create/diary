"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useLoginAdmin } from "@/app/api/generated/auth/auth";
import { saveAccessToken } from "@/app/auth";
import { LoginForm } from "@/app/features/diary/components";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const loginMutation = useLoginAdmin({
    mutation: {
      onSuccess: (data) => {
        saveAccessToken(data.accessToken);
        router.push("/admin");
      },
    },
  });

  return (
    <LoginForm
      errorMessage={loginMutation.isError ? t("failed") : undefined}
      isPending={loginMutation.isPending}
      onSubmit={(values) => loginMutation.mutate({ data: values })}
    />
  );
}
