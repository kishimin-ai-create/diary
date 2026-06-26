import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppProviders } from "./providers";

describe("AppProviders", () => {
  it("renders the Japanese app shell by default", () => {
    // Act
    render(
      <AppProviders>
        <p>child content</p>
      </AppProviders>,
    );

    // Assert
    expect(screen.getByText("つづる日記")).toBeInTheDocument();
    expect(screen.getByAltText("つづる日記のロゴ")).toBeInTheDocument();
    expect(screen.getByText("child content")).toBeInTheDocument();
    expect(screen.getByText("© kishimin 2026")).toBeInTheDocument();
  });

  it("switches visible navigation copy when English is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <AppProviders>
        <p>child content</p>
      </AppProviders>,
    );

    // Act
    await user.selectOptions(screen.getByLabelText("表示言語"), "en");

    // Assert
    expect(screen.getByText("Daybook")).toBeInTheDocument();
    expect(screen.getByAltText("Daybook logo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("keeps the current locale when an unsupported locale value is selected", () => {
    // Arrange
    render(
      <AppProviders>
        <p>child content</p>
      </AppProviders>,
    );

    // Act
    fireEvent.change(screen.getByLabelText("表示言語"), {
      target: { value: "invalid" },
    });

    // Assert
    expect(screen.getByText("つづる日記")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "管理" })).toBeInTheDocument();
  });
});
