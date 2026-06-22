import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import DiaryDetailPage from "./page";
import { messages } from "@/app/i18n/messages";

const useGetDiaryMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "diary-1" }),
}));

vi.mock("@/app/api/generated/diaries/diaries", () => ({
  useGetDiary: useGetDiaryMock,
}));

describe("DiaryDetailPage", () => {
  it("renders diary detail when generated query returns data", () => {
    // Arrange
    useGetDiaryMock.mockReturnValue({
      data: {
        id: "diary-1",
        title: "詳細タイトル",
        content: "詳細本文",
        createdAt: "2026-06-23T08:00:00.000Z",
        updatedAt: "2026-06-23T09:00:00.000Z",
      },
      isError: false,
      isLoading: false,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <DiaryDetailPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByRole("heading", { name: "詳細タイトル" })).toBeInTheDocument();
    expect(screen.getByText("詳細本文")).toBeInTheDocument();
  });

  it("renders not found message when generated query fails", () => {
    // Arrange
    useGetDiaryMock.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    // Act
    render(
      <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
        <DiaryDetailPage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByText("日記が見つかりませんでした。")).toBeInTheDocument();
  });
});
