import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { DiaryDetailView } from "./components";
import { messages } from "@/app/i18n/messages";

const meta = {
  title: "Features/Diary/DiaryDetailView",
  component: DiaryDetailView,
  decorators: [(Story) => <IntlStoryFrame><Story /></IntlStoryFrame>],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DiaryDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    diary: {
      id: "diary-1",
      title: "静かな朝",
      content: "早く起きて、短い日記を書いた。\n今日の作業は小さく始める。",
      createdAt: "2026-06-23T07:30:00.000Z",
      updatedAt: "2026-06-23T08:00:00.000Z",
    },
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
