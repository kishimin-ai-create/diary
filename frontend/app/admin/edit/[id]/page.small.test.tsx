import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import EditDiaryPage from "./page";
import { messages } from "@/app/i18n/messages";

const mutateMock = vi.hoisted(() => vi.fn());
const useGetDiaryMock = vi.hoisted(() => vi.fn());
const useUpdateDiaryMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "diary-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/api/generated/diaries/diaries", () => ({
  useGetDiary: useGetDiaryMock,
  useUpdateDiary: useUpdateDiaryMock,
}));

describe("EditDiaryPage", () => {
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
});
