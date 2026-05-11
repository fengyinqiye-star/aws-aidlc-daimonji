import { describe, expect, it, vi } from "vitest";

import { StartRequestHandler } from "../../src/api/start-request-handler.js";

describe("StartRequestHandler", () => {
  it("persists accepted state and starts the workflow", async () => {
    const stateRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null)
    };
    const eventRepository = {
      append: vi.fn().mockResolvedValue(undefined),
      listByRequestId: vi.fn().mockResolvedValue([])
    };
    const workflowStarter = {
      start: vi.fn().mockResolvedValue({
        executionArn: "arn:aws:states:exec-1",
        startedAt: "2026-05-10T00:00:00.000Z"
      })
    };

    const handler = new StartRequestHandler(
      stateRepository,
      eventRepository,
      workflowStarter
    );

    const response = await handler.handle({
      requestId: "req-1",
      requesterId: "user-1",
      mode: "must-succeed",
      requestedLeaveDate: "2026-06-01",
      reasonSummary: "family event"
    });

    expect(response.state).toBe("accepted");
    expect(stateRepository.save).toHaveBeenCalledOnce();
    expect(eventRepository.append).toHaveBeenCalledOnce();
    expect(workflowStarter.start).toHaveBeenCalledOnce();
  });
});
