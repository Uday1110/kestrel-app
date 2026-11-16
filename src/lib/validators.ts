import { z } from "zod";

export const loginSchema = z.object({
  staffId: z.string().min(1, "Staff ID or corporate email is required"),
  role: z.enum(["RM", "ANALYST", "OWNER"]),
  otpToken: z.string().min(6, "Valid OTP or Entrust code is required").max(10),
  extendedSession: z.boolean().optional().default(true),
});

export const createApplicationSchema = z.object({
  legalName: z.string().min(2, "Company legal name is required"),
  tradeName: z.string().optional(),
  cin: z.string().regex(/^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i, "Valid 21-character CIN is required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/i, "Valid 10-character PAN is required"),
  gstin: z.string().min(15, "15-character GSTIN is required").max(15),
  incorporationDate: z.string().min(4, "Incorporation year or date is required"),
  industrySector: z.string().min(2, "Industry sector is required"),
  registeredAddress: z.string().min(5, "Registered address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "6-digit Pincode is required"),
  contactName: z.string().min(2, "Primary contact name is required"),
  contactEmail: z.string().email("Valid corporate email required"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  facilityType: z.enum([
    "WORKING_CAPITAL",
    "TERM_LOAN",
    "MACHINERY_LOAN",
    "CONSORTIUM_FACILITY"
  ]),
  facilityAmount: z.number().positive("Facility amount must be greater than zero"),
  tenorMonths: z.number().int().min(1).max(120).default(36),
  purpose: z.string().min(5, "Borrowing purpose is required"),
  assignedRmId: z.string().optional(),
});

export const updateChecklistSchema = z.object({
  applicationId: z.string().min(1),
  itemId: z.string().min(1),
  status: z.enum(["CLEARED", "ATTENTION", "MISSING", "WAIVED"]),
  flagReason: z.string().optional().nullable(),
});

export const createOutstandingItemSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(3, "Item title is required"),
  description: z.string().min(5, "Description and instructions are required"),
  category: z.string().default("DOCUMENTATION"),
  severity: z.enum(["CRITICAL", "STANDARD", "LOW"]).default("STANDARD"),
  lastContactedChannel: z.enum(["WHATSAPP", "EMAIL", "SMS", "PHONE"]).default("EMAIL"),
  daysOutstanding: z.number().int().min(0).default(0),
});

export const resolveOutstandingItemSchema = z.object({
  itemId: z.string().min(1),
  resolutionNote: z.string().min(2, "Resolution note is required"),
  documentId: z.string().optional().nullable(),
});

export const updateFinancialExtractionSchema = z.object({
  applicationId: z.string().min(1),
  extractionId: z.string().min(1),
  status: z.enum(["ACCEPTED", "EDITED", "REJECTED", "PENDING"]),
  editedValue: z.string().optional().nullable(),
  analystComment: z.string().optional().nullable(),
});

export const createAnalystNoteSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(2, "Note title is required"),
  content: z.string().min(5, "Note content is required"),
  category: z.enum([
    "GENERAL_OBSERVATION",
    "FINANCIAL_SPREAD",
    "RISK_NOTE",
    "COMPLIANCE"
  ]).default("GENERAL_OBSERVATION"),
});

export const analystDecisionSchema = z.object({
  applicationId: z.string().min(1),
  decision: z.enum([
    "ACKNOWLEDGE_AND_PROCEED",
    "REQUEST_DOCUMENTS",
    "RECOMMEND_SANCTION",
    "REJECT_APPLICATION"
  ]),
  notes: z.string().min(5, "Justification notes required for audit record"),
});
