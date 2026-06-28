import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { lazy, type ComponentType } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { messages } from "./i18n/messages";
import HomePage from "./page";

const shouldSuspendMock = vi.hoisted(() => ({ value: false }));
const pendingModulePromise = vi.hoisted<Promise<{ default: ComponentType }>>(
  () => new Promise(() => undefined),
);
const SuspendedHomePageClient = lazy(() => pendingModulePromise);

vi.mock("./home-page-client", () => ({
  HomePageClient: () => {
    if (shouldSuspendMock.value) {
      return <SuspendedHomePageClient />;
    }
    return <p>home client content</p>;
  },
}));

describe("HomePage", () => {
  beforeEach(() => {
    shouldSuspendMock.value = false;
  });

  it("renders the client diary index inside the page boundary", () => {
    // Act
    render(<HomePage />);

    // Assert
    expect(screen.getByText("home client content")).toBeInTheDocument();
  });

  it("renders the suspense loading fallback with the current English locale", () => {
    // Arrange
    shouldSuspendMock.value = true;

    // Act
    render(
      <NextIntlClientProvider locale="en" messages={messages.en} timeZone="Asia/Tokyo">
        <HomePage />
      </NextIntlClientProvider>,
    );

    // Assert
    expect(screen.getByRole("status")).toHaveClass("full-page-loading");
    expect(screen.getByAltText("Daybook logo")).toBeInTheDocument();
    expect(screen.getByText("Loading diaries.")).toBeInTheDocument();
  });
});
