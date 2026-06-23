import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("./home-page-client", () => ({
  HomePageClient: () => <p>home client content</p>,
}));

describe("HomePage", () => {
  it("renders the client diary index inside the page boundary", () => {
    // Act
    render(<HomePage />);

    // Assert
    expect(screen.getByText("home client content")).toBeInTheDocument();
  });
});
