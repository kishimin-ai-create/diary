import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  AdminDiaryList,
  DiaryDetailView,
  DiaryEditorForm,
  DiaryListView,
  LoginForm,
} from "./components";
import { messages } from "@/app/i18n/messages";

const sampleDiary = {
  id: "diary-1",
  title: "雨の日のメモ",
  contentPreview: "静かな午後に読み返したこと",
  createdAt: "2026-06-22T09:00:00.000Z",
  updatedAt: "2026-06-22T10:00:00.000Z",
};

function renderWithMessages(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="ja" messages={messages.ja}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("DiaryListView", () => {
  it("shows the service logo while diaries are loading", () => {
    renderWithMessages(
      <DiaryListView
        diaries={[]}
        isError={false}
        isLoading={true}
        page={1}
        pageSize={10}
        totalCount={0}
      />,
    );

    expect(screen.getByRole("status")).toHaveClass("full-page-loading");
    expect(screen.getByAltText("つづる日記のロゴ")).toBeInTheDocument();
    expect(screen.getByText("日記を読み込んでいます。")).toBeInTheDocument();
  });

  it("renders diary entries and exposes date search controls", () => {
    renderWithMessages(
      <DiaryListView
        diaries={[sampleDiary]}
        isError={false}
        isLoading={false}
        page={1}
        pageSize={10}
        totalCount={1}
      />,
    );

    expect(screen.getByRole("heading", { name: "日記一覧" })).toBeInTheDocument();
    expect(screen.getByLabelText("日付で絞り込む")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /雨の日のメモ/ })).toBeInTheDocument();
    expect(screen.getByText("静かな午後に読み返したこと")).toBeInTheDocument();
  });

  it("renders created and updated timestamps in Japan time for API UTC values", () => {
    renderWithMessages(
      <DiaryListView
        diaries={[sampleDiary]}
        isError={false}
        isLoading={false}
        page={1}
        pageSize={10}
        totalCount={1}
      />,
    );

    expect(screen.getByText("2026/06/22 18:00")).toBeInTheDocument();
    expect(screen.getByText("2026/06/22 19:00")).toBeInTheDocument();
  });

  it("calls search and pagination handlers when controls are used", async () => {
    const user = userEvent.setup();
    const onDateSearch = vi.fn();
    const onPageChange = vi.fn();
    renderWithMessages(
      <DiaryListView
        date="2026-06-22"
        diaries={[sampleDiary]}
        isError={false}
        isLoading={false}
        onDateSearch={onDateSearch}
        onPageChange={onPageChange}
        page={2}
        pageSize={1}
        totalCount={3}
      />,
    );

    await user.click(screen.getByRole("button", { name: "解除" }));
    await user.click(screen.getByRole("button", { name: "前へ" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(onDateSearch).toHaveBeenCalledWith("");
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});

describe("LoginForm", () => {
  it("uses post method so credentials are not exposed in the URL before hydration", () => {
    renderWithMessages(<LoginForm isPending={false} onSubmit={vi.fn()} />);

    expect(screen.getByRole("form", { name: "管理ログイン" })).toHaveAttribute(
      "method",
      "post",
    );
  });

  it("shows field errors when submitted with empty values", async () => {
    const user = userEvent.setup();
    renderWithMessages(<LoginForm isPending={false} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(screen.getByText("メールアドレスを入力してください。")).toBeInTheDocument();
    expect(screen.getByText("パスワードを入力してください。")).toBeInTheDocument();
  });
});

describe("DiaryDetailView", () => {
  it("renders full diary content and back link", () => {
    renderWithMessages(
      <DiaryDetailView
        diary={{
          id: "diary-1",
          title: "一日の終わり",
          content: "本文をすべて表示する。",
          createdAt: "2026-06-22T09:00:00.000Z",
          updatedAt: "2026-06-22T10:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "一日の終わり" })).toBeInTheDocument();
    expect(screen.getByText("本文をすべて表示する。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "一覧へ戻る" })).toHaveAttribute("href", "/");
  });
});

describe("DiaryEditorForm", () => {
  it("validates title and content before submitting", async () => {
    const user = userEvent.setup();
    renderWithMessages(
      <DiaryEditorForm
        mode="create"
        isPending={false}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("タイトルを入力してください。")).toBeInTheDocument();
    expect(screen.getByText("本文を入力してください。")).toBeInTheDocument();
  });

  it("shows a title length error when title exceeds 100 characters", async () => {
    const user = userEvent.setup();
    renderWithMessages(
      <DiaryEditorForm
        initialDiary={{
          title: "あ".repeat(101),
          content: "本文",
        }}
        mode="create"
        isPending={false}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("タイトルは100文字以内で入力してください。")).toBeInTheDocument();
  });
});

describe("AdminDiaryList", () => {
  it("renders date search controls with created and updated timestamps", () => {
    const onDateSearch = vi.fn();
    renderWithMessages(
      <AdminDiaryList
        date="2026-06-22"
        diaries={[sampleDiary]}
        isDeleting={false}
        onDateSearch={onDateSearch}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "新規作成" })).toBeInTheDocument();
    expect(screen.getByLabelText("日付で絞り込む")).toHaveValue("2026-06-22");
    expect(screen.getByText("2026/06/22 18:00")).toBeInTheDocument();
    expect(screen.getByText("2026/06/22 19:00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "編集" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("calls date search handler when admin date filter controls are used", async () => {
    const user = userEvent.setup();
    const onDateSearch = vi.fn();
    renderWithMessages(
      <AdminDiaryList
        date="2026-06-22"
        diaries={[sampleDiary]}
        isDeleting={false}
        onDateSearch={onDateSearch}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "絞り込む" }));
    await user.click(screen.getByRole("button", { name: "解除" }));

    expect(onDateSearch).toHaveBeenCalledWith("2026-06-22");
    expect(onDateSearch).toHaveBeenCalledWith("");
  });

  it("calls pagination handler when admin pagination controls are used", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithMessages(
      <AdminDiaryList
        date="2026-06-22"
        diaries={[sampleDiary]}
        isDeleting={false}
        onDelete={vi.fn()}
        onPageChange={onPageChange}
        page={2}
        pageSize={1}
        totalCount={3}
      />,
    );

    await user.click(screen.getByRole("button", { name: "前へ" }));
    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(screen.getByText("2 / 3 ページ")).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
