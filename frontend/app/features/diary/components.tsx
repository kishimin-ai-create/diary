"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import type { GetDiary200, ListDiaries200DiariesItem } from "@/app/api/generated/model";

type DiarySummary = ListDiaries200DiariesItem;

interface DiaryListViewProps {
  diaries: DiarySummary[];
  isError: boolean;
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  date?: string;
  onDateSearch?: (date: string) => void;
  onPageChange?: (page: number) => void;
}

interface DiaryEditorFormProps {
  mode: "create" | "edit";
  initialDiary?: Pick<GetDiary200, "title" | "content">;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: { title: string; content: string }) => void;
}

interface LoginFormProps {
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: { email: string; password: string }) => void;
}

interface AdminDiaryListProps {
  date?: string;
  diaries: DiarySummary[];
  isDeleting: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  errorMessage?: string;
  onDateSearch?: (date: string) => void;
  onDelete: (id: string) => void;
  onPageChange?: (page: number) => void;
}

interface FieldErrors {
  title?: string;
  content?: string;
  email?: string;
  password?: string;
}

/**
 * Renders the public diary list with date filtering and pagination controls.
 */
export function DiaryListView({
  diaries,
  isError,
  isLoading,
  page,
  pageSize,
  totalCount,
  date = "",
  onDateSearch,
  onPageChange,
}: DiaryListViewProps) {
  const t = useTranslations("diary");

  return (
    <section className="content-stack">
      <div className="section-header">
        <h1>{t("listTitle")}</h1>
        <DateSearchForm date={date} id="diary-date" onDateSearch={onDateSearch} />
      </div>
      {isLoading ? <DiaryLoadingStatus /> : null}
      {isError ? <p className="status-message error">{t("error")}</p> : null}
      {!isLoading && !isError && diaries.length === 0 ? (
        <p className="status-message">{t("empty")}</p>
      ) : null}
      <div className="diary-list">
        {diaries.map((diary) => (
          <article className="diary-row" key={diary.id}>
            <div>
              <Link href={`/diaries/${diary.id}`}>
                {t("readMore", { title: diary.title })}
              </Link>
              <p>{diary.contentPreview}</p>
            </div>
            <dl>
              <div>
                <dt>{t("createdAt")}</dt>
                <dd>{formatDateTime(diary.createdAt)}</dd>
              </div>
              <div>
                <dt>{t("updatedAt")}</dt>
                <dd>{formatDateTime(diary.updatedAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <PaginationControls
        onPageChange={onPageChange}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </section>
  );
}

/**
 * Renders a full diary entry for the public detail route.
 */
export function DiaryDetailView({ diary }: { diary: GetDiary200 }) {
  const t = useTranslations("diary");

  return (
    <article className="content-stack detail-article">
      <Link href="/" className="inline-link">
        {t("detailBack")}
      </Link>
      <h1>{diary.title}</h1>
      <div className="meta-line">
        <span>
          {t("createdAt")}: {formatDateTime(diary.createdAt)}
        </span>
        <span>
          {t("updatedAt")}: {formatDateTime(diary.updatedAt)}
        </span>
      </div>
      <p className="diary-content">{diary.content}</p>
    </article>
  );
}

/**
 * Renders the admin login form with submit-time validation.
 */
export function LoginForm({ isPending, errorMessage, onSubmit }: LoginFormProps) {
  const t = useTranslations("auth");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = readFormString(formData, "email");
    const password = readRawFormString(formData, "password");
    const nextErrors: FieldErrors = {};
    if (!email) {
      nextErrors.email = t("emailRequired");
    }
    if (!password) {
      nextErrors.password = t("passwordRequired");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit({ email, password });
    }
  }

  return (
    <form
      aria-label={t("title")}
      className="form-panel"
      method="post"
      onSubmit={handleSubmit}
      noValidate
    >
      <h1>{t("title")}</h1>
      <FormField
        id="login-email"
        label={t("email")}
        name="email"
        type="email"
        error={errors.email}
      />
      <FormField
        id="login-password"
        label={t("password")}
        name="password"
        type="password"
        error={errors.password}
      />
      {errorMessage ? <p className="status-message error">{errorMessage}</p> : null}
      <button type="submit" disabled={isPending}>
        {t("submit")}
      </button>
    </form>
  );
}

/**
 * Renders the create and edit diary form.
 */
export function DiaryEditorForm({
  mode,
  initialDiary,
  isPending,
  errorMessage,
  onSubmit,
}: DiaryEditorFormProps) {
  const t = useTranslations("admin");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = readFormString(formData, "title");
    const content = readFormString(formData, "content");
    const nextErrors: FieldErrors = {};
    if (!title) {
      nextErrors.title = t("titleRequired");
    } else if (title.length > 100) {
      nextErrors.title = t("titleTooLong");
    }
    if (!content) {
      nextErrors.content = t("contentRequired");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit({ title, content });
    }
  }

  return (
    <form className="form-panel editor-form" onSubmit={handleSubmit} noValidate>
      <h1>{mode === "create" ? t("formCreateTitle") : t("formEditTitle")}</h1>
      <FormField
        defaultValue={initialDiary?.title}
        error={errors.title}
        id="diary-title"
        label={t("titleField")}
        maxLength={100}
        name="title"
        type="text"
      />
      <label className="field" htmlFor="diary-content">
        <span>{t("contentField")}</span>
        <textarea
          aria-errormessage={errors.content ? "diary-content-error" : undefined}
          aria-invalid={errors.content ? "true" : "false"}
          defaultValue={initialDiary?.content}
          id="diary-content"
          name="content"
          rows={12}
        />
        {errors.content ? (
          <small className="field-error" id="diary-content-error">
            {errors.content}
          </small>
        ) : null}
      </label>
      {errorMessage ? <p className="status-message error">{errorMessage}</p> : null}
      <div className="form-actions">
        <Link className="button-link secondary" href="/admin">
          {t("cancel")}
        </Link>
        <button type="submit" disabled={isPending}>
          {t("save")}
        </button>
      </div>
    </form>
  );
}

/**
 * Renders the authenticated diary management list.
 */
export function AdminDiaryList({
  date = "",
  diaries,
  isDeleting,
  page = 1,
  pageSize = 50,
  totalCount = diaries.length,
  errorMessage,
  onDateSearch,
  onDelete,
  onPageChange,
}: AdminDiaryListProps) {
  const t = useTranslations("admin");
  const tDiary = useTranslations("diary");

  return (
    <section className="content-stack">
      <div className="section-header">
        <h1>{t("title")}</h1>
        <div className="toolbar">
          <DateSearchForm
            date={date}
            id="admin-diary-date"
            onDateSearch={onDateSearch}
          />
          <Link className="button-link" href="/admin/create">
            {t("create")}
          </Link>
        </div>
      </div>
      {errorMessage ? <p className="status-message error">{errorMessage}</p> : null}
      <div className="diary-list">
        {diaries.map((diary) => (
          <article className="diary-row admin-row" key={diary.id}>
            <div>
              <strong>{diary.title}</strong>
              <p>{diary.contentPreview}</p>
              <dl>
                <div>
                  <dt>{tDiary("createdAt")}</dt>
                  <dd>{formatDateTime(diary.createdAt)}</dd>
                </div>
                <div>
                  <dt>{tDiary("updatedAt")}</dt>
                  <dd>{formatDateTime(diary.updatedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="row-actions">
              <Link href={`/admin/edit/${diary.id}`}>
                {t("edit")}
              </Link>
              <button
                type="button"
                className="danger-button"
                disabled={isDeleting}
                onClick={() => {
                  if (window.confirm(t("deleteConfirm"))) {
                    onDelete(diary.id);
                  }
                }}
              >
                {t("delete")}
              </button>
            </div>
          </article>
        ))}
      </div>
      <PaginationControls
        onPageChange={onPageChange}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </section>
  );
}

function PaginationControls({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange?: (page: number) => void;
}) {
  const t = useTranslations("diary");
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="button-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        {t("previous")}
      </button>
      <span>{t("pageStatus", { page, totalPages })}</span>
      <button
        type="button"
        className="button-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
      >
        {t("next")}
      </button>
    </div>
  );
}

function DateSearchForm({
  date = "",
  id,
  onDateSearch,
}: {
  date?: string;
  id: string;
  onDateSearch?: (date: string) => void;
}) {
  const t = useTranslations("diary");
  const [selectedDate, setSelectedDate] = useState(date);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onDateSearch?.(selectedDate);
  }

  return (
    <form className="toolbar" onSubmit={submitSearch}>
      <label htmlFor={id}>{t("searchDate")}</label>
      <input
        id={id}
        type="date"
        value={selectedDate}
        onChange={(event) => setSelectedDate(event.currentTarget.value)}
      />
      <button type="submit">{t("search")}</button>
      <button
        type="button"
        className="button-secondary"
        onClick={() => {
          setSelectedDate("");
          onDateSearch?.("");
        }}
      >
        {t("clearSearch")}
      </button>
    </form>
  );
}

/**
 * Renders the branded loading state used while diary data is being fetched.
 */
export function DiaryLoadingStatus() {
  const tApp = useTranslations("app");
  const tDiary = useTranslations("diary");

  return (
    <div
      aria-live="polite"
      className="full-page-loading"
      role="status"
    >
      <Image
        src="/logo-image.png"
        alt={tApp("logoAlt")}
        width={64}
        height={64}
        priority
      />
      <span>{tDiary("loading")}</span>
    </div>
  );
}

function FormField({
  defaultValue,
  error,
  id,
  label,
  maxLength,
  name,
  type,
}: {
  defaultValue?: string;
  error?: string;
  id: string;
  label: string;
  maxLength?: number;
  name: string;
  type: "email" | "password" | "text";
}) {
  const errorId = `${id}-error`;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        aria-errormessage={error ? errorId : undefined}
        aria-invalid={error ? "true" : "false"}
        defaultValue={defaultValue}
        id={id}
        maxLength={maxLength}
        name={name}
        type={type}
      />
      {error ? (
        <small className="field-error" id={errorId}>
          {error}
        </small>
      ) : null}
    </label>
  );
}

function readFormString(formData: FormData, key: string): string {
  return readRawFormString(formData, key).trim();
}

function readRawFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeZone: "Asia/Tokyo",
    timeStyle: "short",
  }).format(new Date(value));
}
