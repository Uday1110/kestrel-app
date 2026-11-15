export type UserRole = "RM" | "ANALYST" | "ADMIN";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  avatarUrl?: string | null;
}

export type ApplicationStatus =
  | "DRAFT"
  | "DOCS_IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INFO_REQUESTED"
  | "ACKNOWLEDGED"
  | "APPROVED"
  | "REJECTED";

export type IntakeStage =
  | "GATE_1_RM_INTAKE"
  | "GATE_2_AI_CHECKSUM"
  | "GATE_3_BORROWER_CHASING"
  | "GATE_4_UNDERWRITING_DESK"
  | "GATE_5_SANCTION_COMMITTEE";

export type ChecklistItemCategory =
  | "FINANCIAL_STATEMENTS"
  | "BANKING"
  | "REGULATORY_TAX"
  | "LEGAL_CONSTITUTIONAL"
  | "SANCTION_LETTERS";

export type ChecklistStatus = "CLEARED" | "ATTENTION" | "MISSING" | "WAIVED";

export type DocumentValidationStatus = "VALIDATED" | "FLAGGED" | "FAILED" | "PENDING_SCAN";

export interface ValidationDirectiveCheck {
  id: string;
  title: string;
  passed: boolean;
  summary: string;
  details?: string;
  conflictAppRef?: string;
}

export interface DocumentValidationPayload {
  overallStatus: DocumentValidationStatus;
  detectedType: string;
  confidence: number;
  hash: string;
  fileSizeStr: string;
  pageCount: number;
  checks: ValidationDirectiveCheck[];
}

export type OutstandingItemSeverity = "CRITICAL" | "STANDARD" | "LOW";
export type OutstandingItemStatus = "OPEN" | "RESOLVED" | "WAIVED";
export type OutreachChannel = "WHATSAPP" | "EMAIL" | "SMS" | "PHONE";

export type ExtractionStatus = "ACCEPTED" | "EDITED" | "REJECTED" | "PENDING";

export interface FinancialExtractionMetric {
  id: string;
  metricKey: string;
  label: string;
  extractedValue: string;
  numericValue?: number | null;
  unit: string;
  sourceDocumentName?: string | null;
  sourceCitation?: string | null;
  confidence: number;
  status: ExtractionStatus;
  editedValue?: string | null;
  analystComment?: string | null;
}

export interface DashboardMetrics {
  aggregateCycleDays: number;
  preKestrelBaselineDays: number;
  targetSlaDays: number;
  intakeIntegrityPct: number;
  activePipelineValueCr: number;
  underReviewCount: number;
  stages: {
    stageNumber: number;
    id: IntakeStage;
    name: string;
    owner: string;
    days: number;
    pct: number;
    targetSlaDays: number;
    varianceDays: number;
    varianceLabel: string;
    description: string;
    colorClass: string;
  }[];
  queueCounts: {
    total: number;
    readyForReview: number;
    actionRequired: number;
    inProgress: number;
    approved: number;
  };
}
