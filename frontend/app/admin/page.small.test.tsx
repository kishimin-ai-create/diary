import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "./page";
import { messages } from "@/app/i18n/messages";

const invalidateQueriesMock = vi.hoisted(() => vi.fn());
const useAccessTokenMock = vi.hoisted(() => vi.fn());
const useDeleteDiaryMock = vi.hoisted(() => vi.fn());
const useListDiariesMock = vi.hoisted(() => vi.fn());
const deleteMutateMock = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

vi.mock("@/app/auth", () => ({
  useAccessToken: useAccessTokenMock,
}));

vi.mock("@/app/api/generated/diaries/diaries", () => ({
  getListDiariesQueryKey: (params: { page: number; pageSize: number }) => [
    "/api/diaries",
    params,
  ],
  useDeleteDiary: useDeleteDiaryMock,
  useListDiaries: useListDiariesMock,
}));

const sampleDiary = {
  id: "diary-1",
  title: "管理タイトル",
  contentPreview: "管理本文",
  createdAt: "2026-06-23T08:00:00.000Z",
  updatedAt: "2026-06-23T09:00:00.000Z",
};

function renderPage() {
  return render(
    <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
      <AdminPage />
    </NextIntlClientProvider>,
  );
}

describe("AdminPage", () => {
  beforeEach(() => {
    invalidateQueriesMock.mockReset();
    deleteMutateMock.mockReset();
    useAccessTokenMock.mockReset();
    useDeleteDiaryMock.mockReset();
    useListDiariesMock.mockReset();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    useDeleteDiaryMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: deleteMutateMock,
    });
  });

  it("shows login guidance when access token is missing", () => {
    // Arrange
    useAccessTokenMock.mockReturnValue(null);
    useListDiariesMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    });

    // Act
    renderPage();

    // Assert
    expect(screen.getByText("管理画面を開くにはログインしてください。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(useListDiariesMock).toHaveBeenCalledWith(
      { page: 1, pageSize: 50 },
      { query: { enabled: false } },
    );
  });

  it("renders diaries and deletes after confirmation when access token exists", async () => {
    // Arrange
    const user = userEvent.setup();
    useAccessTokenMock.mockReturnValue("token-123");
    useListDiariesMock.mockReturnValue({
      data: { diaries: [sampleDiary], page: 1, pageSize: 50, totalCount: 1 },
      isError: false,
      isLoading: false,
    });

    // Act
    renderPage();
    await user.click(screen.getByRole("button", { name: "削除 管理タイトル" }));

    // Assert
    expect(deleteMutateMock).toHaveBeenCalledWith({ id: "diary-1" });
    expect(useListDiariesMock).toHaveBeenCalledWith(
      { page: 1, pageSize: 50 },
      { query: { enabled: true } },
    );
  });
});
