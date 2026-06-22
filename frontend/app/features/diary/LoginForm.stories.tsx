import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { LoginForm } from "./components";
import { messages } from "@/app/i18n/messages";

const meta = {
  title: "Features/Diary/LoginForm",
  component: LoginForm,
  decorators: [(Story) => <IntlStoryFrame><Story /></IntlStoryFrame>],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isPending: false,
    onSubmit: () => undefined,
  },
};

export const WithError: Story = {
  args: {
    errorMessage: messages.ja.auth.failed,
    isPending: false,
    onSubmit: () => undefined,
  },
};

export const Loading: Story = {
  args: {
    isPending: true,
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
