import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { DiaryListView } from "./components";
import { messages } from "@/app/i18n/messages";

const sampleDiaries = [
  {
    id: "diary-1",
    title: "朝の記録",
    contentPreview: "近所を歩いて、季節の変化を少しだけ見つけた。",
    createdAt: "2026-06-23T08:00:00.000Z",
    updatedAt: "2026-06-23T08:30:00.000Z",
  },
  {
    id: "diary-2",
    title: "夕方のメモ",
    contentPreview: "作業を区切って、明日のために机を片付けた。",
    createdAt: "2026-06-22T18:00:00.000Z",
    updatedAt: "2026-06-22T18:15:00.000Z",
  },
];

const meta = {
  title: "Features/Diary/DiaryListView",
  component: DiaryListView,
  decorators: [(Story) => <IntlStoryFrame><Story /></IntlStoryFrame>],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DiaryListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    diaries: sampleDiaries,
    isError: false,
    isLoading: false,
    page: 1,
    pageSize: 10,
    totalCount: 2,
  },
};

export const Loading: Story = {
  args: {
    diaries: [],
    isError: false,
    isLoading: true,
    page: 1,
    pageSize: 10,
    totalCount: 0,
  },
};

export const Empty: Story = {
  args: {
    diaries: [],
    isError: false,
    isLoading: false,
    page: 1,
    pageSize: 10,
    totalCount: 0,
  },
};

export const Error: Story = {
  args: {
    diaries: [],
    isError: true,
    isLoading: false,
    page: 1,
    pageSize: 10,
    totalCount: 0,
  },
};

export const Mobile: Story = {
  args: Default.args,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

function IntlStoryFrame({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
      <main className="page-shell">{children}</main>
    </NextIntlClientProvider>
  );
}
