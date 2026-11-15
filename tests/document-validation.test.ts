import { describe, it, expect, beforeAll } from "vitest";
import { validateAndUploadDocument } from "@/services/document-service";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types/domain";

describe("Document Ingestion & 4-Directive Validation Engine", () => {
  const rmUser: UserSession = {
    id: "usr_rm_naveen",
    email: "rm.sharma@corporate.kestrel.internal",
    name: "Naveen Sharma",
    role: "RM",
    title: "Relationship Manager",
    department: "West Zone Commercial Lending",
    avatarUrl: null,
  };

  let applicationId: string;

  beforeAll(async () => {
    const app = await prisma.application.findFirst({
      where: { referenceNumber: "APP-2026-0001" },
    });
    if (app) applicationId = app.id;
  });

  it("REJECTS invalid file mime types and file extensions", async () => {
    const invalidBuffer = Buffer.from("malicious_script_content");
    await expect(
      validateAndUploadDocument(
        invalidBuffer,
        "script.exe",
        "application/x-msdownload",
        applicationId,
        "FINANCIALS",
        rmUser
      )
    ).rejects.toThrow(/UNSUPPORTED FILE TYPE/i);
  });

  it("REJECTS files exceeding the 25 MB enterprise limit", async () => {
    // Fake buffer size larger than 25MB
    const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024);
    await expect(
      validateAndUploadDocument(
        oversizedBuffer,
        "huge_audit_report.pdf",
        "application/pdf",
        applicationId,
        "FINANCIALS",
        rmUser
      )
    ).rejects.toThrow(/FILE SIZE EXCEEDED/i);
  });

  it("ACCEPTS compliant PDF documents and produces 4-directive validation report", async () => {
    const validPdfBuffer = Buffer.from(`%PDF-1.4\nTest corporate lending document payload ${Date.now()}`);
    const result = await validateAndUploadDocument(
      validPdfBuffer,
      "FY25_Annual_Report_Validated.pdf",
      "application/pdf",
      applicationId,
      "FINANCIALS",
      rmUser
    );

    expect(result.document).toBeDefined();
    expect(result.document.fileHash).toHaveLength(64); // SHA-256
    expect(result.validationPayload.directives).toHaveLength(4);

    // Directives must include: Legibility & Parsing, Duplicate Detection, Document Type, Page Limits
    const directiveTitles = result.validationPayload.directives.map((d) => d.title);
    expect(directiveTitles.some((t) => t.includes("Readability") || t.includes("Legibility"))).toBe(true);
    expect(directiveTitles.some((t) => t.includes("Duplicate"))).toBe(true);
    expect(directiveTitles.some((t) => t.includes("Document Type"))).toBe(true);
    expect(directiveTitles.some((t) => t.includes("Page Limit"))).toBe(true);
  });

  it("DETECTS duplicate file upload via SHA-256 checksum collision", async () => {
    const uniqueContent = `Duplicate test content ${Date.now()}`;
    const fileBuffer = Buffer.from(uniqueContent);

    // Upload first copy
    const firstUpload = await validateAndUploadDocument(
      fileBuffer,
      "GST_Returns_Original.pdf",
      "application/pdf",
      applicationId,
      "GST_RETURNS",
      rmUser
    );

    expect(firstUpload.validationPayload.isDuplicate).toBe(false);

    // Upload identical copy with identical hash
    const secondUpload = await validateAndUploadDocument(
      fileBuffer,
      "GST_Returns_Duplicate.pdf",
      "application/pdf",
      applicationId,
      "GST_RETURNS",
      rmUser
    );

    expect(secondUpload.validationPayload.isDuplicate).toBe(true);
    expect(secondUpload.document.validationStatus).toBe("FLAGGED");
  });
});
