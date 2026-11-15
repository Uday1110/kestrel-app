import { describe, it, expect } from "vitest";
import { createApplication, submitApplication, updateChecklistStatus, getApplicationById } from "@/services/application-service";
import { resolveOutstandingItem, listOutstandingItems } from "@/services/outstanding-items-service";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types/domain";

describe("Application Lifecycle & RM Intake Workflow", () => {
  const rmUser: UserSession = {
    id: "usr_rm_naveen",
    email: "rm.sharma@corporate.kestrel.internal",
    name: "Naveen Sharma",
    role: "RM",
    title: "Relationship Manager",
    department: "West Zone Commercial Lending",
    avatarUrl: null,
  };

  it("CREATES a new lending application with standard 8-gate checklist", async () => {
    const newApp = await createApplication({
      applicantName: "Apex Manufacturing Solutions Pvt Ltd",
      cin: "U29100MH2021PTC319888",
      pan: "AABCA9102K",
      incorporationDate: "2021-04-12",
      registeredAddress: "Plot 42, Hinjewadi Phase 2, Pune, Maharashtra 411057",
      annualTurnover: 420000000, // 42 Cr
      industrySector: "Industrial Manufacturing",
      contactPerson: "Rajesh Kulkarni",
      contactEmail: "rajesh@apexmanufacturing.example.com",
      contactPhone: "+91 98201 55432",
      facilityType: "WORKING_CAPITAL",
      facilityAmount: 120000000, // 12 Cr
      tenorMonths: 36,
      purposeOfLoan: "Expansion of robotic assembly line and vendor discounting",
      assignedAnalystId: "usr_ca_arunachalam",
      currentUser: rmUser,
    });

    expect(newApp).toBeDefined();
    expect(newApp.referenceNumber).toMatch(/^APP-2026-/);
    expect(newApp.status).toBe("DOCS_IN_PROGRESS");
    expect((newApp as any).checklistItems).toHaveLength(8);
    expect(newApp.intakeReadinessPercent).toBeDefined();

    // Verify readiness starts at 0%
    const fetched = await getApplicationById(newApp.id);
    expect(fetched?.intakeReadinessPercent).toBe(0);
  });

  it("UPDATES checklist items and recalculates application readiness score", async () => {
    const app = await prisma.application.findFirst({
      where: { referenceNumber: "APP-2026-0001" },
      include: { checklistItems: true },
    });

    expect(app).toBeDefined();
    const firstItem = app!.checklistItems[0];

    // Mark first item as CLEARED
    const updated = await updateChecklistStatus({
      checklistItemId: firstItem.id,
      status: "CLEARED",
      flagReason: null,
      currentUser: rmUser,
    });

    expect(updated.status).toBe("CLEARED");

    const refreshedApp = await getApplicationById(app!.id);
    expect(refreshedApp?.intakeReadinessPercent).toBeGreaterThanOrEqual(12); // At least 1/8 = 12.5%
  });

  it("SUBMITS application for analyst triage and creates audit trail", async () => {
    const app = await prisma.application.findFirst({
      where: { referenceNumber: "APP-2026-0001" },
    });

    expect(app).toBeDefined();

    const submitted = await submitApplication(app!.id, rmUser, "Ready for preliminary triage");
    expect(submitted.status).toBe("SUBMITTED");

    // Verify Audit Event
    const event = await prisma.auditEvent.findFirst({
      where: {
        applicationId: app!.id,
        action: "STATUS_TRANSITION_SUBMITTED",
      },
      orderBy: { timestamp: "desc" },
    });

    expect(event).toBeDefined();
    expect(event?.userRole).toBe("RM");
  });

  it("RESOLVES an outstanding item and records verification note", async () => {
    const outstanding = await listOutstandingItems();
    if (outstanding.length > 0) {
      const itemToResolve = outstanding[0];
      const resolved = await resolveOutstandingItem({
        id: itemToResolve.id,
        resolutionNote: "Verified borrower signed addendum received via email",
        currentUser: rmUser,
      });

      expect(resolved.status).toBe("RESOLVED");
      expect(resolved.resolutionNote).toContain("Verified");
    }
  });
});
