import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the main heading", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // Check if the main heading "Moderated Chat" is present
    expect(
      screen.getByRole("heading", { name: /moderated chat/i })
    ).toBeInTheDocument();

    // Check if the settings button is present
    expect(
      screen.getByRole("button", { name: /show settings/i })
    ).toBeInTheDocument();

    // Check if input areas are present (by placeholder)
    expect(screen.getByPlaceholderText(/user 1 reply.../i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/user 2 reply.../i)).toBeInTheDocument();
  });
});
