import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomePageClient } from "./home-page-client";
import { messages } from "./i18n/messages";

const pushMock = vi.fn();
let searchParams = new URLSearchParams();
const useListDiariesMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParams,
}));

vi.mock("./api/generated/diaries/diaries", () => ({
  useListDiaries: useListDiariesMock,
}));

const sampleDiary = {
  id: "diary-1",
  title: "朝の記録",
  contentPreview: "散歩した",
  createdAt: "2026-06-23T08:00:00.000Z",
  updatedAt: "2026-06-23T08:30:00.000Z",
};

function renderWithMessages(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="ja" messages={messages.ja} timeZone="Asia/Tokyo">
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("HomePageClient", () => {
  beforeEach(() => {
    pushMock.mockReset();
    searchParams = new URLSearchParams("page=2&date=2026-06-23");
    useListDiariesMock.mockReturnValue({
      data: {
        diaries: [sampleDiary],
        page: 2,
        pageSize: 10,
        totalCount: 30,
      },
      isError: false,
      isLoading: false,
    });
  });

  it("passes query string page and date to the diary list hook", () => {
    // Act
    renderWithMessages(<HomePageClient />);

    // Assert
    expect(useListDiariesMock).toHaveBeenCalledWith({
      date: "2026-06-23",
      page: 2,
      pageSize: 10,
    });
    expect(screen.getByRole("link", { name: /朝の記録/ })).toBeInTheDocument();
  });

  it("pushes a reset page query when date search is submitted", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMessages(<HomePageClient />);

    // Act
    await user.clear(screen.getByLabelText("日付で絞り込む"));
    await user.type(screen.getByLabelText("日付で絞り込む"), "2026-06-24");
    await user.click(screen.getByRole("button", { name: "絞り込む" }));

    // Assert
    expect(pushMock).toHaveBeenCalledWith("/?page=1&date=2026-06-24");
  });

  it("falls back to first page and omits date when query params are invalid", async () => {
    // Arrange
    const user = userEvent.setup();
    searchParams = new URLSearchParams("page=invalid");
    useListDiariesMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    });

    // Act
    renderWithMessages(<HomePageClient />);
    await user.click(screen.getByRole("button", { name: "絞り込む" }));

    // Assert
    expect(useListDiariesMock).toHaveBeenCalledWith({
      date: undefined,
      page: 1,
      pageSize: 10,
    });
    expect(pushMock).toHaveBeenCalledWith("/?page=1");
  });
});
