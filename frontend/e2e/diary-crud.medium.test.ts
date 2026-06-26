import { expect, test } from "@playwright/test";

interface AdminCredentials {
  email: string;
  password: string;
}

const REQUIRED_ENVIRONMENT_MESSAGE =
  "Set masked E2E credentials and target URL in environment variables.";

test.describe("diary CRUD happy path", () => {
  test("admin user / creates reads updates and deletes a diary / succeeds", async ({
    page,
  }) => {
    const credentials = readAdminCredentials();
    test.skip(credentials === null, REQUIRED_ENVIRONMENT_MESSAGE);
    if (credentials === null) {
      return;
    }

    const timestamp = Date.now();
    const createdTitle = `E2E diary ${timestamp}`;
    const updatedTitle = `E2E diary updated ${timestamp}`;
    const createdContent = `Created content ${timestamp}`;
    const updatedContent = `Updated content ${timestamp}`;

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
