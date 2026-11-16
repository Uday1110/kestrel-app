export type UserRole = "RM" | "ANALYST" | "ADMIN" | "OWNER";

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

export interface UrgentException {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  category: "POLICY_REVIEW" | "UNRESOLVED_CHASE" | "SOD_CONFLICT" | "SYSTEM_ALERT";
  description: string;
  source: string;
  actionRequired: string;
}

export interface OwnerOverviewMetrics {
  throughput: number;
  automationStpRate: number;
  manualHandlingRate: number;
  errorRate: number;
  averageCycleDays: number;
  openAuditFindings: number;
  activePipelineCr: number;
  checksumIntegrityPct: number;
  lastUpdated: string;
  freshnessStatus: "FRESH" | "STALE" | "ERROR";
  urgentExceptions: UrgentException[];
}

export interface GovernancePolicyRecord {
  id: string;
  name: string;
  scope: string;
  version: string;
  owner: string;
  approvingAuthority: string | null;
  approvalDate: string | null;
  lastReviewDate: string | null;
  nextReviewDue: string | null;
  status: "COMPLIANT" | "REVIEW_OVERDUE" | "MISSING_APPROVAL_RECORD";
  enforcementMode: "AUTOMATED_STRICT" | "HUMAN_MANDATORY";
}

export interface ThresholdSetting {
  key: string;
  label: string;
  currentValue: string | number;
  unit: string;
  description: string;
  changeHistory: {
    id: string;
    changedBy: string;
    changedAt: string;
    previousValue: string;
    newValue: string;
    justification: string;
  }[];
}

export interface AccessOverviewRecord {
  userId: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: string[];
  hasConflictingPrivilege: boolean;
  conflictReason?: string;
}

export interface CaseTraceStep {
  name: string;
  stage: string;
  status: "COMPLETED" | "IN_PROGRESS" | "FLAGGED" | "PENDING";
  latencyMs: number;
  latencyDisplay: string;
  confidence?: number;
  retries: number;
  manualRouted: boolean;
  timestamp: string;
}

export interface CaseTrace {
  applicationId: string;
  referenceNumber: string;
  borrowerNameMasked: string;
  cinMasked: string;
  panMasked: string;
  contactEmailMasked: string;
  contactPhoneMasked: string;
  facilityType: string;
  facilityAmountCr: number;
  submittedAt: string;
  currentStage: string;
  outcome: "APPROVED" | "UNDER_REVIEW" | "REJECTED" | "FLAGGED";
  isManualRouted: boolean;
  steps: CaseTraceStep[];
}

export interface StructuredLogEntry {
  id: string;
  timestamp: string;
  sourceSystem: string;
  level: "ERROR" | "WARN" | "INFO";
  action: string;
  message: string;
  detailsMasked: string;
  retries: number;
  retentionPolicy: string;
}

export interface AlertRuleConfig {
  id: string;
  name: string;
  metric: string;
  operator: ">" | "<" | ">=";
  threshold: number;
  unit: string;
  currentValue: number;
  status: "OK" | "TRIGGERED";
  notificationTarget: string;
  lastTriggeredAt: string | null;
}

export interface CostCategoryDetail {
  amountInr: number;
  pct: number;
  label: string;
  isMeasured: boolean;
  basis: string;
}

export interface VendorTolerance {
  vendorName: string;
  service: string;
  unitCost: number;
  unitCostTolerance: number;
  unit: string;
  exceedsTolerance: boolean;
  status: "WITHIN_BUDGET" | "EXCEEDS_TOLERANCE";
}

export interface MonthlyProjection {
  month: string;
  volume: number;
  projectedCostInr: number;
  actualCostInr?: number;
}

export interface CostAnalytics {
  period: string;
  totalMonthlyCostInr: number;
  costPerTransactionInr: number;
  costPerCompletedOutcomeInr: number;
  categories: {
    compute: CostCategoryDetail;
    storage: CostCategoryDetail;
    thirdParty: CostCategoryDetail;
    supportEffort: CostCategoryDetail;
  };
  vendorTolerances: VendorTolerance[];
  monthlyProjections: MonthlyProjection[];
  disclaimer: string;
}
