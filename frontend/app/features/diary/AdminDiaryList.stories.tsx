import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { AdminDiaryList } from "./components";
import { messages } from "@/app/i18n/messages";

const sampleDiaries = [
  {
    id: "diary-1",
    title: "管理対象の日記",
    contentPreview: "管理画面で編集や削除を確認するための本文。",
    createdAt: "2026-06-23T08:00:00.000Z",
    updatedAt: "2026-06-23T08:30:00.000Z",
  },
];

const meta = {
  title: "Features/Diary/AdminDiaryList",
  component: AdminDiaryList,
  decorators: [(Story) => <IntlStoryFrame><Story /></IntlStoryFrame>],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminDiaryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    diaries: sampleDiaries,
    isDeleting: false,
    onDelete: () => undefined,
  },
};

export const Empty: Story = {
  args: {
    diaries: [],
    isDeleting: false,
    onDelete: () => undefined,
  },
};

export const Deleting: Story = {
  args: {
    diaries: sampleDiaries,
    isDeleting: true,
    onDelete: () => undefined,
  },
};

export const WithError: Story = {
  args: {
    diaries: sampleDiaries,
    errorMessage: messages.ja.admin.deleteFailed,
    isDeleting: false,
    onDelete: () => undefined,
  },
};

function IntlStoryFrame({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
      <main className="page-shell">{children}</main>
    </NextIntlClientProvider>
  );
}
