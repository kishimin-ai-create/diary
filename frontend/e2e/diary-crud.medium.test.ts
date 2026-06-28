import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

interface AdminCredentials {
  email: string;
  password: string;
}

const REQUIRED_ENVIRONMENT_MESSAGE =
  "Set masked E2E credentials and target URL in environment variables.";

test.describe("diary CRUD happy path", () => {
  test("admin user / creates reads updates and deletes a diary / succeeds", async ({
    page,
    request,
  }) => {
    const credentials = readAdminCredentials();
    test.skip(credentials === null, REQUIRED_ENVIRONMENT_MESSAGE);
    if (credentials === null) {
      return;
    }

    await waitForAuthProxyReady(request, credentials);

    const testRunId = randomUUID();
    const createdTitle = `E2E diary ${testRunId}`;
    const updatedTitle = `E2E diary updated ${testRunId}`;
    const createdContent = `Created content ${testRunId}`;
    const updatedContent = `Updated content ${testRunId}`;

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(credentials.email);
    await page.getByLabel("パスワード").fill(credentials.password);
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/auth/login"),
    );
    await page.getByRole("button", { name: "ログイン" }).click();
    expect((await loginResponsePromise).status()).toBe(200);

    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: "新規作成" }).click();
    await page.getByLabel("タイトル").fill(createdTitle);
    await page.getByLabel("本文").fill(createdContent);
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/diaries"),
    );
    await page.getByRole("button", { name: "保存" }).click();
    expect((await createResponsePromise).status()).toBe(201);

    await expect(page).toHaveURL(/\/admin$/);
    const createdRow = page.locator("article").filter({ hasText: createdTitle });
    await expect(createdRow).toBeVisible();

    await createdRow.getByRole("link", { name: "編集" }).click();
    await page.getByLabel("タイトル").fill(updatedTitle);
    await page.getByLabel("本文").fill(updatedContent);
    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().includes("/api/diaries/"),
    );
    await page.getByRole("button", { name: "保存" }).click();
    expect((await updateResponsePromise).status()).toBe(204);

    await expect(page).toHaveURL(/\/admin$/);
    const updatedRow = page.locator("article").filter({ hasText: updatedTitle });
    await expect(updatedRow).toBeVisible();
    await expect(page.getByText(updatedContent)).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: `${updatedTitle} を読む` }).click();
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
    await expect(page.getByText(updatedContent)).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/admin");
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/api/diaries/"),
    );
    const deleteRow = page.locator("article").filter({ hasText: updatedTitle });
    await deleteRow.getByRole("button", { name: "削除" }).click();
    expect((await deleteResponsePromise).status()).toBe(204);

    await expect(page.getByText(updatedTitle)).toHaveCount(0);
  });
});

function readAdminCredentials(): AdminCredentials | null {
  const email = process.env["E2E_ADMIN_EMAIL"];
  const password = process.env["E2E_ADMIN_PASSWORD"];

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

async function waitForAuthProxyReady(
  request: APIRequestContext,
  credentials: AdminCredentials,
): Promise<void> {
  const transientStatuses = new Set([502, 503, 504]);
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await request.post("/api/auth/login", {
      data: credentials,
      failOnStatusCode: false,
    });
    lastStatus = response.status();
    if (lastStatus === 200) {
      return;
    }
    if (!transientStatuses.has(lastStatus)) {
      expect(lastStatus).toBe(200);
      return;
    }
    await delay(attempt * 1_000);
  }

  expect(lastStatus).toBe(200);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
