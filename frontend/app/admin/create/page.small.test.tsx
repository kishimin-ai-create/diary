import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CreateDiaryPage from "./page";
import { messages } from "@/app/i18n/messages";

const mutateMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const useAccessTokenMock = vi.hoisted(() => vi.fn());
type CreateOptions = { mutation: { onSuccess: () => void } };
type CreateResult = {
  isError: boolean;
  isPending: boolean;
  mutate: typeof mutateMock;
};
const createOptions = vi.hoisted<Array<{ mutation: { onSuccess: () => void } }>>(
  () => [],
);
const useCreateDiaryMock = vi.hoisted(() =>
  vi.fn<(options: CreateOptions) => CreateResult>(),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/auth", () => ({
  useAccessToken: useAccessTokenMock,
}));

vi.mock("@/app/api/generated/diaries/diaries", () => ({
  useCreateDiary: useCreateDiaryMock,
}));

describe("CreateDiaryPage", () => {
  beforeEach(() => {
    createOptions.length = 0;
    mutateMock.mockReset();
    pushMock.mockReset();
    useAccessTokenMock.mockReset();
    useCreateDiaryMock.mockReset();
    useAccessTokenMock.mockReturnValue("token-123");
  });

  it("shows login guidance instead of the editor when access token is missing", () => {
    // Arrange
    useAccessTokenMock.mockReturnValue(null);
    useCreateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <CreateDiaryPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByText("管理画面を開くにはログインしてください。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByLabelText("タイトル")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("本文")).not.toBeInTheDocument();
  });

  it("redirects to admin when create succeeds", () => {
    // Arrange
    useCreateDiaryMock.mockImplementation((options) => {
      createOptions.push(options);
      return {
        isError: false,
        isPending: false,
        mutate: mutateMock,
      };
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <CreateDiaryPage />
      </NextIntlClientProvider>,
    );
    createOptions[0]?.mutation.onSuccess();

    // Assert
    expect(pushMock).toHaveBeenCalledWith("/admin");
  });

  it("submits valid diary input through the generated create mutation", async () => {
    // Arrange
    const user = userEvent.setup();
    useCreateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <CreateDiaryPage />
      </NextIntlClientProvider>,
    );

    // Act
    await user.type(screen.getByLabelText("タイトル"), "今日の記録");
    await user.type(screen.getByLabelText("本文"), "よく歩いた。");
    await user.click(screen.getByRole("button", { name: "保存" }));

    // Assert
    expect(mutateMock).toHaveBeenCalledWith({
      data: {
        title: "今日の記録",
        content: "よく歩いた。",
      },
    });
  });

  it("shows a save error when create mutation fails", () => {
    // Arrange
    useCreateDiaryMock.mockReturnValue({
      isError: true,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <CreateDiaryPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByText("保存できませんでした。")).toBeInTheDocument();
  });
});
