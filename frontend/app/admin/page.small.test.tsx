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

interface DeleteDiaryOptions {
  mutation: {
    onSuccess: () => void;
  };
}

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
    await user.click(screen.getByRole("button", { name: "削除" }));

    // Assert
    expect(deleteMutateMock).toHaveBeenCalledWith({ id: "diary-1" });
    expect(useListDiariesMock).toHaveBeenCalledWith(
      { date: undefined, page: 1, pageSize: 50 },
      { query: { enabled: true } },
    );
  });

  it("passes selected date to the diary list query when admin filters by date", async () => {
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
    await user.type(screen.getByLabelText("日付で絞り込む"), "2026-06-23");
    await user.click(screen.getByRole("button", { name: "絞り込む" }));

    // Assert
    expect(useListDiariesMock).toHaveBeenLastCalledWith(
      { date: "2026-06-23", page: 1, pageSize: 50 },
      { query: { enabled: true } },
    );
  });

  it("passes selected page to the diary list query when admin changes pages", async () => {
    // Arrange
    const user = userEvent.setup();
    useAccessTokenMock.mockReturnValue("token-123");
    useListDiariesMock.mockReturnValue({
      data: { diaries: [sampleDiary], page: 1, pageSize: 50, totalCount: 51 },
      isError: false,
      isLoading: false,
    });

    // Act
    renderPage();
    await user.click(screen.getByRole("button", { name: "次へ" }));

    // Assert
    expect(useListDiariesMock).toHaveBeenLastCalledWith(
      { date: undefined, page: 2, pageSize: 50 },
      { query: { enabled: true } },
    );
  });

  it("resets admin pagination when filtering by date", async () => {
    // Arrange
    const user = userEvent.setup();
    useAccessTokenMock.mockReturnValue("token-123");
    useListDiariesMock.mockReturnValue({
      data: { diaries: [sampleDiary], page: 1, pageSize: 50, totalCount: 51 },
      isError: false,
      isLoading: false,
    });

    // Act
    renderPage();
    await user.click(screen.getByRole("button", { name: "次へ" }));
    await user.type(screen.getByLabelText("日付で絞り込む"), "2026-06-23");
    await user.click(screen.getByRole("button", { name: "絞り込む" }));

    // Assert
    expect(useListDiariesMock).toHaveBeenLastCalledWith(
      { date: "2026-06-23", page: 1, pageSize: 50 },
      { query: { enabled: true } },
    );
  });

  it("shows loading message when diary list is loading for an authenticated admin", () => {
    // Arrange
    useAccessTokenMock.mockReturnValue("token-123");
    useListDiariesMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });

    // Act
    renderPage();

    // Assert
    expect(screen.getByRole("status")).toHaveClass("full-page-loading");
    expect(screen.getByAltText("つづる日記のロゴ")).toBeInTheDocument();
    expect(screen.getByText("日記を読み込んでいます。")).toBeInTheDocument();
  });

  it("shows delete failure message when diary query fails for an authenticated admin", () => {
    // Arrange
    useAccessTokenMock.mockReturnValue("token-123");
    useListDiariesMock.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    // Act
    renderPage();

    // Assert
    expect(screen.getByText("削除できませんでした。")).toBeInTheDocument();
  });

  it("invalidates diary list query when delete mutation succeeds", () => {
    // Arrange
    useAccessTokenMock.mockReturnValue("token-123");
    useListDiariesMock.mockReturnValue({
      data: { diaries: [], page: 1, pageSize: 50, totalCount: 0 },
      isError: false,
      isLoading: false,
    });
    useDeleteDiaryMock.mockImplementation((options: DeleteDiaryOptions) => {
      options.mutation.onSuccess();
      return {
        isError: false,
        isPending: false,
        mutate: deleteMutateMock,
      };
    });

    // Act
    renderPage();

    // Assert
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ["/api/diaries", { date: undefined, page: 1, pageSize: 50 }],
    });
  });
});
