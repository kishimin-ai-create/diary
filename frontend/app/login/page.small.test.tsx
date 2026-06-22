import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "./page";
import { messages } from "@/app/i18n/messages";

const mutateMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const useLoginAdminMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/api/generated/auth/auth", () => ({
  useLoginAdmin: useLoginAdminMock,
}));

describe("LoginPage", () => {
  it("submits credentials through the generated login mutation", async () => {
    // Arrange
    const user = userEvent.setup();
    useLoginAdminMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <LoginPage />
      </NextIntlClientProvider>,
    );

    // Act
    await user.type(screen.getByLabelText("メールアドレス"), "admin@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    // Assert
    expect(mutateMock).toHaveBeenCalledWith({
      data: {
        email: "admin@example.com",
        password: "password",
      },
    });
  });

  it("shows a generic login error when login mutation fails", () => {
    // Arrange
    useLoginAdminMock.mockReturnValue({
      isError: true,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <LoginPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(
      screen.getByText("メールアドレスまたはパスワードが正しくありません。"),
    ).toBeInTheDocument();
  });
});
