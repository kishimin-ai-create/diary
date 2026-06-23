import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { DiaryEditorForm } from "./components";
import { messages } from "@/app/i18n/messages";

const meta = {
  title: "Features/Diary/DiaryEditorForm",
  component: DiaryEditorForm,
  decorators: [(Story) => <IntlStoryFrame><Story /></IntlStoryFrame>],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DiaryEditorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    isPending: false,
    mode: "create",
    onSubmit: () => undefined,
  },
};

export const Edit: Story = {
  args: {
    initialDiary: {
      title: "既存の日記",
      content: "読み返してから少しだけ書き直す。",
    },
    isPending: false,
    mode: "edit",
    onSubmit: () => undefined,
  },
};

export const WithError: Story = {
  args: {
    errorMessage: messages.ja.admin.saveFailed,
    isPending: false,
    mode: "create",
    onSubmit: () => undefined,
  },
};

export const Loading: Story = {
  args: {
    isPending: true,
    mode: "create",
    onSubmit: () => undefined,
  },
};

function IntlStoryFrame({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
      {children}
    </NextIntlClientProvider>
  );
}
