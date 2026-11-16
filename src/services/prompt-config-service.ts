import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types/domain";

export type OutreachTone = "FORMAL_INSTITUTIONAL" | "URGENT_DIRECTIVE" | "COLLABORATIVE_ADVISORY";
export type ExtractionTone = "STRICT_ARITHMETIC" | "CONSERVATIVE_AUDIT";
export type AssistantTone = "NEUTRAL_FACTUAL" | "CREDIT_POLICY_STRICT";

export interface PromptToneConfig {
  outreach: {
    tone: OutreachTone;
    whatsappTemplate: string;
    emailPrompt: string;
    smsTemplate: string;
    toneGuidance: string;
  };
  financialExtraction: {
    tone: ExtractionTone;
    systemPrompt: string;
    confidenceThreshold: number;
  };
  underwritingAssistant: {
    tone: AssistantTone;
    systemPrompt: string;
    boundaryNotice: string;
  };
  lastUpdated: string;
  updatedBy: string;
  changeHistory: {
    id: string;
    timestamp: string;
    changedBy: string;
    category: string;
    summary: string;
  }[];
}

const CONFIG_DIR = path.join(process.cwd(), "storage", "config");
const CONFIG_FILE = path.join(CONFIG_DIR, "prompts-tone.json");

const DEFAULT_CONFIG: PromptToneConfig = {
  outreach: {
    tone: "FORMAL_INSTITUTIONAL",
    whatsappTemplate:
      "Dear {contactName}, your lending file ({referenceNumber}) for {legalName} is pending: {title}. Kindly upload via your secure portal link: https://portal.kestrel.internal/intake/upload?ref={referenceNumber}",
    emailPrompt:
      "You are Kestrel Finance's Automated Commercial Outreach Service. Draft a formal institutional notice to {contactName} requesting missing corporate lending document '{title}'. Maintain a professional commercial banking tone citing RBI Master Direction guidelines. Include the secure upload link and a 48-hour response deadline.",
    smsTemplate:
      "KESTREL FINANCE: Urgent update required for facility {referenceNumber}. Missing item: {title}. Upload securely: https://portal.kestrel.internal/u/{referenceNumber}",
    toneGuidance:
      "Formal institutional tone prioritizing regulatory adherence, unambiguous document specifications, and clear submission deadlines.",
  },
  financialExtraction: {
    tone: "STRICT_ARITHMETIC",
    systemPrompt:
      "Extract financial line items from uploaded audited balance sheets and profit & loss statements. Do not extrapolate, guess, or invent numbers. Provide exact source document citation including page and line number. If tabular legibility is below 95% confidence, flag the metric for human analystspread reconciliation.",
    confidenceThreshold: 95.0,
  },
  underwritingAssistant: {
    tone: "NEUTRAL_FACTUAL",
    systemPrompt:
      "You are Kestrel's Credit Underwriting Preparation Assistant. Provide purely mathematical, factual summaries of borrower financials. Under Institutional Lending Charter Section 4.2 and Cycle Governance Directive 2026.Q1, you are strictly prohibited from generating automated credit ratings, sanction recommendations, or loan decisions.",
    boundaryNotice:
      "Strict Human Underwriting Boundary Active: Mathematical summaries only. Zero algorithmic credit decisions.",
  },
  lastUpdated: "2026-11-15T10:00:00.000Z",
  updatedBy: "System Baseline (Model Risk Committee)",
  changeHistory: [
    {
      id: "PROMPT-CHG-001",
      timestamp: "2026-11-15T10:00:00.000Z",
      changedBy: "System Baseline",
      category: "INITIAL_CONFIGURATION",
      summary: "Baseline commercial outreach and financial extraction prompts initialized.",
    },
  ],
};

function ensureConfigFile(): PromptToneConfig {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
      return DEFAULT_CONFIG;
    }
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to read prompt config file, using default:", err);
    return DEFAULT_CONFIG;
  }
}

export async function getPromptToneConfig(): Promise<PromptToneConfig> {
  return ensureConfigFile();
}

export async function updatePromptToneConfig(
  updates: Partial<PromptToneConfig>,
  currentUser: UserSession
): Promise<PromptToneConfig> {
  if (currentUser.role !== "OWNER") {
    throw new Error("FORBIDDEN: Only System Owners are authorized to modify AI prompts and communication tones.");
  }

  const current = ensureConfigFile();
  const now = new Date().toISOString();

  const changeSummaries: string[] = [];

  if (updates.outreach) {
    if (updates.outreach.tone && updates.outreach.tone !== current.outreach.tone) {
      changeSummaries.push(`Outreach tone changed from ${current.outreach.tone} to ${updates.outreach.tone}`);
    }
    if (updates.outreach.whatsappTemplate && updates.outreach.whatsappTemplate !== current.outreach.whatsappTemplate) {
      changeSummaries.push("WhatsApp template updated");
    }
    if (updates.outreach.emailPrompt && updates.outreach.emailPrompt !== current.outreach.emailPrompt) {
      changeSummaries.push("Email prompt directive updated");
    }
    current.outreach = { ...current.outreach, ...updates.outreach };
  }

  if (updates.financialExtraction) {
    if (updates.financialExtraction.systemPrompt && updates.financialExtraction.systemPrompt !== current.financialExtraction.systemPrompt) {
      changeSummaries.push("Financial extraction system prompt modified");
    }
    if (updates.financialExtraction.tone && updates.financialExtraction.tone !== current.financialExtraction.tone) {
      changeSummaries.push(`Extraction tone changed to ${updates.financialExtraction.tone}`);
    }
    current.financialExtraction = { ...current.financialExtraction, ...updates.financialExtraction };
  }

  if (updates.underwritingAssistant) {
    if (updates.underwritingAssistant.systemPrompt && updates.underwritingAssistant.systemPrompt !== current.underwritingAssistant.systemPrompt) {
      changeSummaries.push("Underwriting assistant system prompt modified");
    }
    if (updates.underwritingAssistant.tone && updates.underwritingAssistant.tone !== current.underwritingAssistant.tone) {
      changeSummaries.push(`Underwriting tone changed to ${updates.underwritingAssistant.tone}`);
    }
    current.underwritingAssistant = { ...current.underwritingAssistant, ...updates.underwritingAssistant };
  }

  const changeDescription = changeSummaries.length > 0 ? changeSummaries.join("; ") : "Prompts & tone settings updated";

  const newHistoryEntry = {
    id: `PROMPT-CHG-${Date.now().toString().slice(-6)}`,
    timestamp: now,
    changedBy: `${currentUser.name} (${currentUser.role})`,
    category: "OWNER_RECONFIGURATION",
    summary: changeDescription,
  };

  current.lastUpdated = now;
  current.updatedBy = `${currentUser.name} (${currentUser.email})`;
  current.changeHistory = [newHistoryEntry, ...(current.changeHistory || [])].slice(0, 20);

  // Persist to storage
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(current, null, 2), "utf-8");

  // Record full audit event in DB
  try {
    await prisma.auditEvent.create({
      data: {
        userId: currentUser.id,
        userRole: currentUser.role,
        action: "PROMPT_TONE_CONFIG_UPDATED",
        summary: `System Owner ${currentUser.name} updated prompts and tone: ${changeDescription}`,
        metadata: JSON.stringify({
          updatedBy: currentUser.email,
          timestamp: now,
          changes: changeSummaries,
          outreachTone: current.outreach.tone,
          extractionTone: current.financialExtraction.tone,
        }),
      },
    });
  } catch (auditErr) {
    console.warn("Failed to log prompt update audit event:", auditErr);
  }

  return current;
}
