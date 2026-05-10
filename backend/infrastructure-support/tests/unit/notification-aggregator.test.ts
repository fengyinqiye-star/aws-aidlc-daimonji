import { describe, expect, it } from "vitest";

import { NotificationAggregator } from "../../src/notifications/notification-aggregator.js";

describe("NotificationAggregator", () => {
  it("aggregates workflow-level high-severity notifications", () => {
    const aggregator = new NotificationAggregator();
    const notification = aggregator.aggregate({
      workflowExecutionId: "exec-1",
      failureCategory: "fatal",
      requestState: {
        requestId: "req-1",
        requesterId: "user-1",
        mode: "must-succeed",
        requestedLeaveDate: "2026-06-01",
        reasonSummary: "event",
        currentState: "calendar-registration-failed",
        currentOwner: "ai",
        createdAt: "2026-05-10T00:00:00.000Z",
        updatedAt: "2026-05-10T00:00:00.000Z"
      },
      events: [
        {
          eventId: "evt-1",
          requestId: "req-1",
          eventType: "FatalErrorRaised",
          summary: "calendar registration fatal",
          causedBy: "workflow",
          occurredAt: "2026-05-10T00:00:00.000Z"
        }
      ]
    });

    expect(notification.summary).toContain("req-1");
    expect(notification.eventSummaries).toEqual(["calendar registration fatal"]);
  });
});
