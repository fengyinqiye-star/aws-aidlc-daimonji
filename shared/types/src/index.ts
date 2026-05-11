export type VacationMode = "must-succeed" | "best-effort";

export type RequestState =
  | "accepted"
  | "negotiating"
  | "needs-escalation"
  | "approved"
  | "rejected"
  | "calendar-registration-failed";

export type FailureCategory = "transient" | "business" | "fatal";

export type RetryResult = "pending" | "succeeded" | "exhausted";

export interface StartWorkflowPayload {
  requestId: string;
  requesterId: string;
  mode: VacationMode;
  requestedLeaveDate: string;
  reasonSummary: string;
  requestedAt: string;
}

export interface RequestStateRecord {
  requestId: string;
  requesterId: string;
  mode: VacationMode;
  requestedLeaveDate: string;
  reasonSummary: string;
  currentState: RequestState;
  currentOwner: "ai" | "lawyer-agent";
  slackThreadRef?: string;
  calendarApprovalStatus?: "pending" | "approved" | "declined";
  finalOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestEventRecord {
  eventId: string;
  requestId: string;
  eventType:
    | "RequestAccepted"
    | "NegotiationStarted"
    | "SlackMessageSent"
    | "SlackReplyReceived"
    | "EscalationEvaluated"
    | "LawyerEscalationStarted"
    | "NegotiationSucceeded"
    | "NegotiationRejected"
    | "CalendarApprovalRequested"
    | "CalendarApprovalGranted"
    | "CalendarRegistrationSucceeded"
    | "CalendarRegistrationFailed"
    | "RetryScheduled"
    | "FatalErrorRaised";
  stateBefore?: RequestState;
  stateAfter?: RequestState;
  summary: string;
  detailRef?: string;
  causedBy: "system" | "user" | "manager" | "lawyer-agent" | "workflow";
  occurredAt: string;
}

export interface EscalationDecisionRecord {
  decisionId: string;
  requestId: string;
  decision: "continue" | "needs-escalation";
  reasonSummary: string;
  inputLogRange: string;
  decidedAt: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialIntervalSeconds: number;
  backoffRate: number;
}

export interface RetryRecord {
  retryId: string;
  requestId: string;
  targetOperation: string;
  attemptNumber: number;
  maxAttempts: number;
  failureCategory: FailureCategory;
  scheduledAt: string;
  finishedAt?: string;
  result: RetryResult;
}

export interface WorkflowStartResult {
  requestState: RequestStateRecord;
  acceptedEvent: RequestEventRecord;
}

export interface FatalUiNotice {
  requestId: string;
  title: string;
  message: string;
  failureCategory: FailureCategory;
}
