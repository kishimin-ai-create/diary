import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "./page";
import { readAccessToken } from "@/app/auth";
import { messages } from "@/app/i18n/messages";

const mutateMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
type LoginOptions = { mutation: { onSuccess: (data: { accessToken: string }) => void } };
type LoginResult = {
  isError: boolean;
  isPending: boolean;
  mutate: typeof mutateMock;
};
const loginOptions = vi.hoisted<
  Array<{ mutation: { onSuccess: (data: { accessToken: string }) => void } }>
>(() => []);
const useLoginAdminMock = vi.hoisted(() =>
  vi.fn<(options: LoginOptions) => LoginResult>(),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/api/generated/auth/auth", () => ({
  useLoginAdmin: useLoginAdminMock,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginOptions.length = 0;
    mutateMock.mockReset();
    pushMock.mockReset();
    useLoginAdminMock.mockReset();
    window.sessionStorage.clear();
  });

  it("stores token and redirects to admin when login succeeds", () => {
    // Arrange
    loginOptions.length = 0;
    useLoginAdminMock.mockImplementation((options) => {
      loginOptions.push(options);
      return {
        isError: false,
        isPending: false,
        mutate: mutateMock,
      };
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <LoginPage />
      </NextIntlClientProvider>,
    );
    loginOptions[0]?.mutation.onSuccess({ accessToken: "token-789" });

    // Assert
    expect(readAccessToken()).toBe("token-789");
    expect(pushMock).toHaveBeenCalledWith("/admin");
  });

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

  it("trims email while preserving password whitespace for login", async () => {
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
    await user.type(screen.getByLabelText("メールアドレス"), " admin@example.com ");
    await user.type(screen.getByLabelText("パスワード"), " password ");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    // Assert
    expect(mutateMock).toHaveBeenCalledWith({
      data: {
        email: "admin@example.com",
        password: " password ",
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
