import { describe, expect, it, vi } from "vitest";

import { WorkflowStarter } from "../../src/workflow/workflow-starter.js";

describe("WorkflowStarter", () => {
  it("builds a workflow payload and starts execution", async () => {
    const orchestrator = {
      start: vi.fn().mockResolvedValue({
        executionArn: "arn:aws:states:ap-northeast-1:123:execution:test",
        startedAt: "2026-01-01T00:00:00.000Z"
      })
    };

    const starter = new WorkflowStarter(orchestrator);
    const result = await starter.start({
      requestId: "req-1",
      requesterId: "user-1",
      mode: "must-succeed",
      requestedLeaveDate: "2026-06-01",
      reasonSummary: "family event",
      requestedAt: "2026-05-10T00:00:00.000Z"
    });

    expect(result.executionArn).toContain("execution:test");
    expect(orchestrator.start).toHaveBeenCalledWith(
      expect.objectContaining({
        executionName: "req-1",
        payload: expect.objectContaining({
          requestId: "req-1",
          requesterId: "user-1"
        })
      })
    );
  });
});
