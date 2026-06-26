import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditDiaryPage from "./page";
import { messages } from "@/app/i18n/messages";

const mutateMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const useAccessTokenMock = vi.hoisted(() => vi.fn());
type UpdateOptions = { mutation: { onSuccess: () => void } };
type UpdateResult = {
  isError: boolean;
  isPending: boolean;
  mutate: typeof mutateMock;
};
const updateOptions = vi.hoisted<Array<{ mutation: { onSuccess: () => void } }>>(
  () => [],
);
const useGetDiaryMock = vi.hoisted(() => vi.fn());
const useUpdateDiaryMock = vi.hoisted(() =>
  vi.fn<(options: UpdateOptions) => UpdateResult>(),
);

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "diary-1" }),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/auth", () => ({
  useAccessToken: useAccessTokenMock,
}));

vi.mock("@/app/api/generated/diaries/diaries", () => ({
  useGetDiary: useGetDiaryMock,
  useUpdateDiary: useUpdateDiaryMock,
}));

describe("EditDiaryPage", () => {
  beforeEach(() => {
    updateOptions.length = 0;
    mutateMock.mockReset();
    pushMock.mockReset();
    useAccessTokenMock.mockReset();
    useGetDiaryMock.mockReset();
    useUpdateDiaryMock.mockReset();
    useAccessTokenMock.mockReturnValue("token-123");
  });

  it("shows login guidance instead of the editor when access token is missing", () => {
    // Arrange
    useAccessTokenMock.mockReturnValue(null);
    useGetDiaryMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    });
    useUpdateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <EditDiaryPage />
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

  it("redirects to admin when update succeeds", () => {
    // Arrange
    useGetDiaryMock.mockReturnValue({
      data: {
        id: "diary-1",
        title: "元のタイトル",
        content: "元の本文",
        createdAt: "2026-06-23T08:00:00.000Z",
        updatedAt: "2026-06-23T09:00:00.000Z",
      },
      isError: false,
      isLoading: false,
    });
    useUpdateDiaryMock.mockImplementation((options) => {
      updateOptions.push(options);
      return {
        isError: false,
        isPending: false,
        mutate: mutateMock,
      };
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <EditDiaryPage />
      </NextIntlClientProvider>,
    );
    updateOptions[0]?.mutation.onSuccess();

    // Assert
    expect(pushMock).toHaveBeenCalledWith("/admin");
  });

  it("renders existing diary values and submits updates through generated mutation", async () => {
    // Arrange
    const user = userEvent.setup();
    useGetDiaryMock.mockReturnValue({
      data: {
        id: "diary-1",
        title: "元のタイトル",
        content: "元の本文",
        createdAt: "2026-06-23T08:00:00.000Z",
        updatedAt: "2026-06-23T09:00:00.000Z",
      },
      isError: false,
      isLoading: false,
    });
    useUpdateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <EditDiaryPage />
      </NextIntlClientProvider>,
    );

    // Act
    await user.clear(screen.getByLabelText("タイトル"));
    await user.type(screen.getByLabelText("タイトル"), "更新タイトル");
    await user.clear(screen.getByLabelText("本文"));
    await user.type(screen.getByLabelText("本文"), "更新本文");
    await user.click(screen.getByRole("button", { name: "保存" }));

    // Assert
    expect(mutateMock).toHaveBeenCalledWith({
      id: "diary-1",
      data: {
        title: "更新タイトル",
        content: "更新本文",
      },
    });
  });

  it("shows loading state while diary detail is loading", () => {
    // Arrange
    useGetDiaryMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });
    useUpdateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <EditDiaryPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByText("日記を読み込んでいます。")).toBeInTheDocument();
  });

  it("shows loading state with the current English locale", () => {
    // Arrange
    useGetDiaryMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });
    useUpdateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="en" messages={messages.en} timeZone="Asia/Tokyo">
        <EditDiaryPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByRole("status")).toHaveClass("full-page-loading");
    expect(screen.getByAltText("Daybook logo")).toBeInTheDocument();
    expect(screen.getByText("Loading diaries.")).toBeInTheDocument();
  });

  it("shows save error when diary detail cannot be loaded", () => {
    // Arrange
    useGetDiaryMock.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });
    useUpdateDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: mutateMock,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <EditDiaryPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByText("保存できませんでした。")).toBeInTheDocument();
  });
});
