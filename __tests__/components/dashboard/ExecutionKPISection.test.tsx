import { render, screen, act } from "@testing-library/react";
import { ExecutionKPISection } from "@/components/dashboard/ExecutionKPISection";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useSocket } from "@/hooks/useSocket";
import type { DashboardSummary } from "@/types";

vi.mock("@/hooks/useSocket", () => ({
  useSocket: vi.fn(),
}));

describe("ExecutionKPISection", () => {
  const mockSummary: DashboardSummary = {
    total_projects: 10,
    active_projects: 5,
    total_tickets: 100,
    blocked_tickets: 5,
    utilization_percent: 80,
    sync_pending_tickets: 0,
    success_rate: 0.85, // 85%
    avg_completion_time_hours: 2.5,
    active_ai_executions: 3,
    queued_ai_executions: 12,
  };

  let mockSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    };
    (useSocket as any).mockReturnValue({ socket: mockSocket, connected: true });
  });

  it("renders the success rate accurately", () => {
    render(<ExecutionKPISection summary={mockSummary} />);

    // Check for the "85%" text in the document
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders the average completion time", () => {
    render(<ExecutionKPISection summary={mockSummary} />);

    // Component renders value and unit as separate elements
    expect(screen.getByText("2.5")).toBeInTheDocument();
    expect(screen.getByText("hours")).toBeInTheDocument();
  });

  it("renders initial live load metrics", () => {
    render(<ExecutionKPISection summary={mockSummary} />);

    // 3 active, 12 queued
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("updates live load metrics on socket events", async () => {
    let startedCallback: any;
    let finishedCallback: any;

    mockSocket.on.mockImplementation((event: string, cb: any) => {
      if (event === "execution:started") startedCallback = cb;
      if (event === "execution:finished") finishedCallback = cb;
    });

    render(<ExecutionKPISection summary={mockSummary} />);

    // Simulate execution:started event (e.g. going from Queued -> In Progress)
    // This could mean active++, queued-- depending on business logic, but typically
    // new execution means active increments. Let's assume standard behavior.
    act(() => {
      startedCallback({
        executionId: "exec-1",
        status: "IN_PROGRESS",
        timestamp: new Date().toISOString(),
      });
    });

    // We should see active go up to 4
    expect(await screen.findByText("4")).toBeInTheDocument();

    act(() => {
      finishedCallback({
        executionId: "exec-1",
        status: "COMPLETED",
        timestamp: new Date().toISOString(),
      });
    });

    // Active should drop back to 3
    expect(await screen.findByText("3")).toBeInTheDocument();
  });

  it("renders empty states smoothly if summary data is missing", () => {
    const emptySummary = {
      total_projects: 0,
      active_projects: 0,
      total_tickets: 0,
      blocked_tickets: 0,
      utilization_percent: 0,
      sync_pending_tickets: 0,
    };
    render(<ExecutionKPISection summary={emptySummary} />);

    // Check if it renders 0% or N/A
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });
});
