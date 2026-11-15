import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Kestrel Finance Corporate Lending database...");

  // Clean existing records
  await prisma.auditEvent.deleteMany({});
  await prisma.analystNote.deleteMany({});
  await prisma.financialExtraction.deleteMany({});
  await prisma.outstandingItem.deleteMany({});
  await prisma.checklistItem.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.applicantBusiness.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Staff Users
  const rmUser = await prisma.user.create({
    data: {
      id: "usr_rm_naveen",
      email: "rm.sharma@corporate.kestrel.internal",
      name: "Naveen Sharma",
      role: "RM",
      title: "Relationship Manager (RM)",
      department: "West Zone Commercial Lending",
      avatarUrl: "/avatars/naveen.png",
    },
  });

  const analystUser = await prisma.user.create({
    data: {
      id: "usr_ca_arunachalam",
      email: "analyst.williams@corporate.kestrel.internal",
      name: "Arunachalam V.",
      role: "ANALYST",
      title: "Lead Underwriting Analyst",
      department: "Credit Risk & Underwriting",
      avatarUrl: "/avatars/arunachalam.png",
    },
  });

  const priyaRm = await prisma.user.create({
    data: {
      id: "usr_rm_priya",
      email: "priya.deshmukh@corporate.kestrel.internal",
      name: "Priya Deshmukh",
      role: "RM",
      title: "Senior RM - Emerging Corporates",
      department: "North Corridor Commercial",
    },
  });

  console.log("Created users:", [rmUser.name, analystUser.name, priyaRm.name]);

  // 2. Businesses
  const business1 = await prisma.applicantBusiness.create({
    data: {
      id: "biz_sample_applicant",
      legalName: "Sample Applicant Pvt Ltd",
      cin: "U28112PN2018PTC178923",
      pan: "AAACS1234F",
      gstin: "27AAACS1234F1Z5",
      incorporationDate: "2018-06-14",
      industrySector: "Light Engineering",
      registeredAddress: "Plot 42, MIDC Bhosari Industrial Area",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411026",
      contactName: "Vikram Malhotra",
      contactEmail: "v.malhotra@sampleapplicant.in",
      contactPhone: "+91 98201 44821",
      riskBand: "A-",
      turnoverCr: 48.25,
    },
  });

  const business2 = await prisma.applicantBusiness.create({
    data: {
      id: "biz_bharat_heavy",
      legalName: "Bharat Heavy Forge Industrial Ltd",
      cin: "L27100MH1998PLC114299",
      pan: "AABCB9912K",
      gstin: "27AABCB9912K1Z9",
      incorporationDate: "1998-11-20",
      industrySector: "Heavy Engineering",
      registeredAddress: "Sector 9, Chakan Phase II, Pune Expressway",
      city: "Pune",
      state: "Maharashtra",
      pincode: "410501",
      contactName: "Sandeep Rao",
      contactEmail: "sandeep.rao@bharatheavyforge.com",
      contactPhone: "+91 98330 11928",
      riskBand: "A+",
      turnoverCr: 380.0,
    },
  });

  const business3 = await prisma.applicantBusiness.create({
    data: {
      id: "biz_bharat_biotech",
      legalName: "Bharat Biotech Engineering Ltd",
      cin: "L24230TG1996PLC025689",
      pan: "AAFCB8821M",
      gstin: "36AAFCB8821M1Z2",
      incorporationDate: "1996-03-12",
      industrySector: "Healthcare & Life Sciences",
      registeredAddress: "Genome Valley, Turkapally, Shamirpet",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500078",
      contactName: "Dr. K. Srinivas",
      contactEmail: "k.srinivas@bharatbiotecheng.com",
      contactPhone: "+91 99490 88210",
      riskBand: "AAA",
      turnoverCr: 120.5,
    },
  });

  const business4 = await prisma.applicantBusiness.create({
    data: {
      id: "biz_apex_zenith",
      legalName: "Apex Zenith Logistics Pvt Ltd",
      cin: "U60200DL2017PTC318991",
      pan: "AABCA7712E",
      gstin: "07AABCA7712E1ZQ",
      incorporationDate: "2017-09-08",
      industrySector: "Logistics & Supply Chain",
      registeredAddress: "Building 4, Freight Hub, Mahipalpur",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110037",
      contactName: "Rajeev Goel",
      contactEmail: "r.goel@apexlogistics.in",
      contactPhone: "+91 98110 55432",
      riskBand: "BBB+",
      turnoverCr: 65.0,
    },
  });

  const business5 = await prisma.applicantBusiness.create({
    data: {
      id: "biz_zenith_tools",
      legalName: "Zenith Precision Tools Ltd",
      cin: "U29220MH2016PLC281203",
      pan: "AAECZ4491J",
      gstin: "27AAECZ4491J1ZT",
      incorporationDate: "2016-02-18",
      industrySector: "Precision Tooling",
      registeredAddress: "Plot C-18, Wagle Estate",
      city: "Thane",
      state: "Maharashtra",
      pincode: "400604",
      contactName: "Anil Kulkarni",
      contactEmail: "anil@zenithprecision.com",
      contactPhone: "+91 98212 99401",
      riskBand: "A",
      turnoverCr: 42.0,
    },
  });

  const business6 = await prisma.applicantBusiness.create({
    data: {
      id: "biz_kalyani_infra",
      legalName: "Kalyani Infrastructure Pvt Ltd",
      cin: "U45200MH2019PTC320144",
      pan: "AAGCK5512B",
      gstin: "27AAGCK5512B1ZY",
      incorporationDate: "2019-01-24",
      industrySector: "Civil Infrastructure",
      registeredAddress: "Kalyani Towers, Bund Garden Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      contactName: "Rohan Kalyani",
      contactEmail: "rohan@kalyaniinfra.in",
      contactPhone: "+91 98220 18833",
      riskBand: "A-",
      turnoverCr: 94.0,
    },
  });

  // 3. Applications
  // App 1: Sample Applicant (Primary RM Checklist & Demo Case)
  const app1 = await prisma.application.create({
    data: {
      id: "app_2026_0001",
      referenceNumber: "APP-2026-0001",
      businessId: business1.id,
      assignedRmId: rmUser.id,
      assignedAnalystId: analystUser.id,
      facilityType: "WORKING_CAPITAL",
      facilityAmount: 1800000, // ₹ 18,00,000 (18 Lakhs)
      tenorMonths: 36,
      purpose: "Working Capital Term Loan for raw material procurement and precision tooling expansion",
      status: "DOCS_IN_PROGRESS",
      intakeStage: "GATE_1_RM_INTAKE",
      intakeReadinessPercent: 50.0,
      createdAt: new Date("2026-03-15T09:30:00Z"),
    },
  });

  // App 2: Bharat Heavy Forge (Large Facility, Underwriting Review)
  const app2 = await prisma.application.create({
    data: {
      id: "app_2026_8841",
      referenceNumber: "APP-2026-8841",
      businessId: business2.id,
      assignedRmId: rmUser.id,
      assignedAnalystId: analystUser.id,
      facilityType: "CONSORTIUM_FACILITY",
      facilityAmount: 1425000000, // ₹ 142.50 Cr
      tenorMonths: 60,
      purpose: "Syndicated working capital consortium line and export credit guarantee",
      status: "UNDER_REVIEW",
      intakeStage: "GATE_4_UNDERWRITING_DESK",
      intakeReadinessPercent: 78.0,
      submittedAt: new Date("2026-03-18T14:30:00Z"),
      underwritingStartedAt: new Date("2026-03-19T10:00:00Z"),
      targetDisbursalDate: new Date("2026-03-31T00:00:00Z"),
      createdAt: new Date("2026-03-10T11:00:00Z"),
    },
  });

  // App 3: Bharat Biotech (100% Cleared in Analyst Queue)
  const app3 = await prisma.application.create({
    data: {
      id: "app_2026_0007",
      referenceNumber: "APP-2026-0007",
      businessId: business3.id,
      assignedRmId: rmUser.id,
      assignedAnalystId: analystUser.id,
      facilityType: "TERM_LOAN",
      facilityAmount: 7500000, // ₹ 75 Lakhs
      tenorMonths: 48,
      purpose: "Cleanroom expansion and bioreactor sterilization equipment import",
      status: "SUBMITTED",
      intakeStage: "GATE_4_UNDERWRITING_DESK",
      intakeReadinessPercent: 100.0,
      submittedAt: new Date("2026-03-20T08:15:00Z"),
      createdAt: new Date("2026-03-12T10:00:00Z"),
    },
  });

  // App 4: Apex Zenith Logistics (Overdue Outstanding Items)
  const app4 = await prisma.application.create({
    data: {
      id: "app_2026_9042",
      referenceNumber: "APP-2026-9042",
      businessId: business4.id,
      assignedRmId: priyaRm.id,
      assignedAnalystId: analystUser.id,
      facilityType: "MACHINERY_LOAN",
      facilityAmount: 25000000, // ₹ 2.50 Cr
      tenorMonths: 60,
      purpose: "Fleet expansion - 15 Heavy commercial EV trucks",
      status: "INFO_REQUESTED",
      intakeStage: "GATE_3_BORROWER_CHASING",
      intakeReadinessPercent: 37.5,
      createdAt: new Date("2026-03-01T09:00:00Z"),
    },
  });

  // App 5: Zenith Precision (Acknowledged, Memo in progress)
  const app5 = await prisma.application.create({
    data: {
      id: "app_2026_5512",
      referenceNumber: "APP-2026-5512",
      businessId: business5.id,
      assignedRmId: rmUser.id,
      assignedAnalystId: analystUser.id,
      facilityType: "MACHINERY_LOAN",
      facilityAmount: 4500000, // ₹ 45 Lakhs
      tenorMonths: 36,
      purpose: "5-axis CNC Milling machine procurement",
      status: "ACKNOWLEDGED",
      intakeStage: "GATE_4_UNDERWRITING_DESK",
      intakeReadinessPercent: 100.0,
      submittedAt: new Date("2026-03-17T11:00:00Z"),
      createdAt: new Date("2026-03-08T09:00:00Z"),
    },
  });

  // App 6: Kalyani Infra (Approved by Analyst)
  const app6 = await prisma.application.create({
    data: {
      id: "app_2026_1033",
      referenceNumber: "APP-2026-1033",
      businessId: business6.id,
      assignedRmId: rmUser.id,
      assignedAnalystId: analystUser.id,
      facilityType: "WORKING_CAPITAL",
      facilityAmount: 80000000, // ₹ 8.00 Cr
      tenorMonths: 36,
      purpose: "Bridge financing for state highway EPC project subcontract",
      status: "APPROVED",
      intakeStage: "GATE_5_SANCTION_COMMITTEE",
      intakeReadinessPercent: 100.0,
      submittedAt: new Date("2026-03-05T10:00:00Z"),
      finalDecisionAt: new Date("2026-03-16T16:00:00Z"),
      finalDecision: "APPROVED",
      decisionReason: "Debt service coverage robust at 2.1x; verified collateral backing with 150% security cover.",
      createdAt: new Date("2026-02-28T09:00:00Z"),
    },
  });

  // 4. Documents for App 1 & App 2
  const doc1 = await prisma.document.create({
    data: {
      id: "doc_audited_fin_01",
      applicationId: app1.id,
      fileName: "FY24_25_Audited_Accounts_Sample.pdf",
      originalName: "FY24_25_Audited_Accounts_Sample.pdf",
      fileSize: 8400000, // 8.4 MB
      mimeType: "application/pdf",
      fileHash: "4f82a9bc7190e21dae605197351a3c8bdd595af2d2a9bc3025bca48ea23311fa",
      storagePath: "audited_finances_sample.pdf",
      category: "AUDITED_FINANCIALS",
      pageCount: 28,
      source: "By CA K. Sharma (External)",
      validationStatus: "VALIDATED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-18T11:24:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "VALIDATED",
        detectedType: "Audited Balance Sheet & P&L",
        confidence: 0.994,
        hash: "4f82a9...11fa",
        fileSizeStr: "8.4 MB",
        pageCount: 28,
        checks: [
          { id: "c1", title: "File Readability & Text Legibility", passed: true, summary: "High optical clarity at 300 DPI; complete character matrix extracted." },
          { id: "c2", title: "Duplicate Check against Repository", passed: true, summary: "No conflicting SHA-256 hash match found in repository." },
          { id: "c3", title: "Document Type Specification", passed: true, summary: "Matches Schedule III MCA21 taxonomy with valid UDIN." },
          { id: "c4", title: "Page Limit & Integrity Validation", passed: true, summary: "28 pages, digital signatures validated, no stream corruption." }
        ]
      }),
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      id: "doc_bank_stmt_01",
      applicationId: app1.id,
      fileName: "HDFC_Bank_Stmt_Apr25_Mar26.pdf",
      originalName: "HDFC_Bank_Stmt_Apr25_Mar26.pdf",
      fileSize: 14100000, // 14.1 MB
      mimeType: "application/pdf",
      fileHash: "901bc74f82a9bc7190e21dae605197351a3c8bdd595af2d2a9bc3025bca48ea2",
      storagePath: "hdfc_stmt_consolidated.pdf",
      category: "BANK_STATEMENTS",
      pageCount: 64,
      source: "Via Perfios / NetBanking",
      validationStatus: "VALIDATED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-19T09:12:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "VALIDATED",
        detectedType: "Bank Statement (12 Months)",
        confidence: 0.998,
        hash: "901bc7...8ea2",
        fileSizeStr: "14.1 MB",
        pageCount: 64,
        checks: [
          { id: "c1", title: "File Readability & Text Legibility", passed: true, summary: "Digitally generated e-statement parsed cleanly." },
          { id: "c2", title: "Duplicate Check against Repository", passed: true, summary: "Unique account statement payload." },
          { id: "c3", title: "Document Type Specification", passed: true, summary: "Format matches HDFC Corporate NetBanking format." },
          { id: "c4", title: "Page Limit & Integrity Validation", passed: true, summary: "64 pages, complete transaction ledger without gaps." }
        ]
      }),
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      id: "doc_gst_returns_01",
      applicationId: app1.id,
      fileName: "GSTR_3B_Consolidated_2025.zip",
      originalName: "GSTR_3B_Consolidated_2025.zip",
      fileSize: 3200000,
      mimeType: "application/zip",
      fileHash: "d84f09a12c82c3f901bc7190e21dae605197351a3c8bdd595af2d2a9bc3025bc",
      storagePath: "gstr_3b_consolidated.zip",
      category: "GST_RETURNS",
      pageCount: 12,
      source: "RM Intake Terminal",
      validationStatus: "FLAGGED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-20T14:02:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "FLAGGED",
        detectedType: "GSTR-3B Monthly Filings",
        confidence: 0.94,
        hash: "d84f09...25bc",
        fileSizeStr: "3.2 MB",
        pageCount: 12,
        checks: [
          { id: "c1", title: "File Readability & Text Legibility", passed: true, summary: "Valid JSON schema payload extracted." },
          { id: "c2", title: "Duplicate Check against Repository", passed: false, summary: "Exact hash match previously uploaded under loan package APP-2025-0814.", conflictAppRef: "APP-2025-0814" },
          { id: "c3", title: "Document Type Specification", passed: true, summary: "Tax schedule matches GSTR-3B schema." },
          { id: "c4", title: "Page Limit & Integrity Validation", passed: true, summary: "12 filing months included." }
        ]
      }),
    },
  });

  const doc4 = await prisma.document.create({
    data: {
      id: "doc_itr_filings_01",
      applicationId: app1.id,
      fileName: "ITR6_AY2024_25_Acknowledgement.pdf",
      originalName: "ITR6_AY2024_25_Acknowledgement.pdf",
      fileSize: 1800000,
      mimeType: "application/pdf",
      fileHash: "3311fa901bc74f82a9bc7190e21dae605197351a3c8bdd595af2d2a9bc3025bc",
      storagePath: "itr6_sample.pdf",
      category: "ITR_FILINGS",
      pageCount: 8,
      source: "Client Portal Submission",
      validationStatus: "FLAGGED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-19T16:45:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "FLAGGED",
        detectedType: "ITR-6 Corporate Return",
        confidence: 0.72,
        hash: "3311fa...25bc",
        fileSizeStr: "1.8 MB",
        pageCount: 8,
        checks: [
          { id: "c1", title: "File Readability & Text Legibility", passed: false, summary: "Scan blur detected on page 3 computational schedule (DPI < 150). Text unreadable." },
          { id: "c2", title: "Duplicate Check against Repository", passed: true, summary: "No duplicate hash match." },
          { id: "c3", title: "Document Type Specification", passed: true, summary: "Income Tax Department ITR-6 layout." },
          { id: "c4", title: "Page Limit & Integrity Validation", passed: true, summary: "8 pages complete." }
        ]
      }),
    },
  });

  const doc5 = await prisma.document.create({
    data: {
      id: "doc_board_res_01",
      applicationId: app1.id,
      fileName: "Board_Resolution_Borrowing_Powers_Signed.pdf",
      originalName: "Board_Resolution_Borrowing_Powers_Signed.pdf",
      fileSize: 2200000,
      mimeType: "application/pdf",
      fileHash: "7190e21dae605197351a3c8bdd595af2d2a9bc3025bca48ea23311fa4f82a9bc",
      storagePath: "board_resolution_sample.pdf",
      category: "BOARD_RESOLUTION",
      pageCount: 4,
      source: "RM Desk Direct Ingestion",
      validationStatus: "VALIDATED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-18T15:20:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "VALIDATED",
        detectedType: "Board Resolution Under Section 179/180",
        confidence: 0.99,
        hash: "7190e2...a9bc",
        fileSizeStr: "2.2 MB",
        pageCount: 4,
        checks: [
          { id: "c1", title: "File Readability & Text Legibility", passed: true, summary: "High clarity digital certified scan." },
          { id: "c2", title: "Duplicate Check against Repository", passed: true, summary: "Unique legal entity authorization." },
          { id: "c3", title: "Document Type Specification", passed: true, summary: "Certified True Copy with active director DIN numbers." },
          { id: "c4", title: "Page Limit & Integrity Validation", passed: true, summary: "4 pages signed and sealed." }
        ]
      }),
    },
  });

  const doc6 = await prisma.document.create({
    data: {
      id: "doc_promoter_kyc_01",
      applicationId: app1.id,
      fileName: "Promoter_Directors_KYC_Dossier.pdf",
      originalName: "Promoter_Directors_KYC_Dossier.pdf",
      fileSize: 4500000,
      mimeType: "application/pdf",
      fileHash: "ae605197351a3c8bdd595af2d2a9bc3025bca48ea23311fa4f82a9bc7190e21d",
      storagePath: "promoter_kyc_sample.pdf",
      category: "KYC_DOCUMENT",
      pageCount: 10,
      source: "UIDAI / C-KYC Sync",
      validationStatus: "VALIDATED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-17T12:00:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "VALIDATED",
        detectedType: "Promoter KYC Package",
        confidence: 0.999,
        hash: "ae6051...e21d",
        fileSizeStr: "4.5 MB",
        pageCount: 10,
        checks: [
          { id: "c1", title: "File Readability & Text Legibility", passed: true, summary: "Vectorized government ID scans." },
          { id: "c2", title: "Duplicate Check against Repository", passed: true, summary: "Verified individual IDs." },
          { id: "c3", title: "Document Type Specification", passed: true, summary: "Aadhaar / PAN verification verified against NSDL/UIDAI." },
          { id: "c4", title: "Page Limit & Integrity Validation", passed: true, summary: "10 pages intact." }
        ]
      }),
    },
  });

  // Also create Bharat Heavy Forge's flagged sanction letter for Upload Validation Drawer mockup match
  await prisma.document.create({
    data: {
      id: "doc_sanction_pnb_q3",
      applicationId: app2.id,
      fileName: "sanction_letter_pnb_q3.pdf",
      originalName: "sanction_letter_pnb_q3.pdf",
      fileSize: 2800000, // 2.8 MB
      mimeType: "application/pdf",
      fileHash: "d84f09a12c82c3901bc7sanctionpnbq3verified59af2d2a9bc3025bca48ea2",
      storagePath: "sanction_letter_pnb_q3.pdf",
      category: "SANCTION_LETTER",
      pageCount: 6,
      source: "Consortium Agent Lead",
      validationStatus: "FLAGGED",
      uploadedByUserId: rmUser.id,
      uploadedAt: new Date("2026-03-19T14:10:00Z"),
      validationDetails: JSON.stringify({
        overallStatus: "FLAGGED",
        detectedType: "Sanction Letter / Facility Schedule",
        confidence: 0.994,
        hash: "d84f09a12c82c3...901bc7",
        fileSizeStr: "2.8 MB",
        pageCount: 6,
        checks: [
          {
            id: "c1",
            title: "File Readability & Text Legibility",
            passed: true,
            summary: "High optical clarity verified at 300 DPI, clear digital print with complete character matrices extracted without skew."
          },
          {
            id: "c2",
            title: "Duplicate Check against Repository",
            passed: false,
            summary: "This exact document checksum was previously uploaded on 14 Jan 2026 under borrower group entity APP-2025-9012.",
            conflictAppRef: "APP-2025-9012"
          },
          {
            id: "c3",
            title: "Document Type Specification",
            passed: true,
            summary: "Matches required Sanction letter format. Watermarks, signing seal anchors, and schedule layout correspond with PNB Corporate standard."
          },
          {
            id: "c4",
            title: "Page Limit & Integrity Validation",
            passed: true,
            summary: "6 pages detected, well within 20-page threshold. No stream corruption, unreferenced objects, or detached attachments discovered."
          }
        ]
      }),
    },
  });

  // 5. Checklist Items for App 1 (Sample Applicant Pvt Ltd)
  const checklistData = [
    {
      itemIndex: 1,
      category: "FINANCIAL_STATEMENTS",
      title: "Audited Financials (Last 2 Years)",
      specification: "Balance Sheet, P&L, Auditor Notes with UDIN stamp",
      status: "CLEARED",
      documentId: doc1.id,
      verifiedAt: new Date("2026-03-18T11:30:00Z"),
      verifiedByUserId: analystUser.id,
    },
    {
      itemIndex: 2,
      category: "BANKING",
      title: "Bank Statements (Last 12 Months)",
      specification: "Primary Current Account - HDFC CC A/c 5020008819",
      status: "CLEARED",
      documentId: doc2.id,
      verifiedAt: new Date("2026-03-19T09:30:00Z"),
      verifiedByUserId: analystUser.id,
    },
    {
      itemIndex: 3,
      category: "REGULATORY_TAX",
      title: "GST Returns (Last 12 Months)",
      specification: "GSTR-3B & GSTR-1 matching batch receipts",
      status: "ATTENTION",
      flagReason: "Exact Hash Match with APP-2025-0814 (Duplicate checksum alert)",
      documentId: doc3.id,
    },
    {
      itemIndex: 4,
      category: "REGULATORY_TAX",
      title: "Income Tax Returns & Computation (Last 2 AY)",
      specification: "ITR-6 with tax audit report 3CA/3CD",
      status: "ATTENTION",
      flagReason: "OCR scan unreadable on page 3 computational schedule (Low DPI)",
      documentId: doc4.id,
    },
    {
      itemIndex: 5,
      category: "LEGAL_CONSTITUTIONAL",
      title: "Board Resolution & Borrowing Power Authorization",
      specification: "Certified True Copy under Section 179/180(1)(c) of Companies Act",
      status: "CLEARED",
      documentId: doc5.id,
      verifiedAt: new Date("2026-03-18T15:30:00Z"),
      verifiedByUserId: analystUser.id,
    },
    {
      itemIndex: 6,
      category: "LEGAL_CONSTITUTIONAL",
      title: "Promoter & Director KYC Dossier",
      specification: "PAN, Aadhaar, DIN registry, and C-KYC verification",
      status: "CLEARED",
      documentId: doc6.id,
      verifiedAt: new Date("2026-03-17T12:15:00Z"),
      verifiedByUserId: analystUser.id,
    },
    {
      itemIndex: 7,
      category: "FINANCIAL_STATEMENTS",
      title: "Pro-forma Invoices / Machinery Quotations",
      specification: "Original vendor quotation for precision tooling equipment",
      status: "MISSING",
      flagReason: "Missing manufacturer quotation from L&T Tools",
    },
    {
      itemIndex: 8,
      category: "SANCTION_LETTERS",
      title: "Existing Credit Facility Sanction Letters",
      specification: "All current banking arrangements & NOC copies",
      status: "MISSING",
      flagReason: "Awaiting sanction letters from existing consortium lenders",
    },
  ];

  for (const item of checklistData) {
    await prisma.checklistItem.create({
      data: {
        applicationId: app1.id,
        ...item,
      },
    });
  }

  // 6. Outstanding Items for App 1 & App 4
  await prisma.outstandingItem.create({
    data: {
      applicationId: app1.id,
      title: "Resolve Duplicate GST Return Batch",
      description: "GSTR-3B uploaded has exact SHA256 checksum match with prior loan package APP-2025-0814. Upload official certified GST portal return.",
      category: "TAX_REGULATORY",
      severity: "CRITICAL",
      status: "OPEN",
      daysOutstanding: 3,
      requestedByUserId: analystUser.id,
      lastContactedChannel: "WHATSAPP",
      lastContactedAt: new Date("2026-03-20T10:00:00Z"),
    },
  });

  await prisma.outstandingItem.create({
    data: {
      applicationId: app1.id,
      title: "Re-upload High-Resolution ITR-6 Filing",
      description: "Page 3 of the computation sheet was flagged as illegible by OCR engine. Provide clear 300 DPI PDF scan.",
      category: "TAX_REGULATORY",
      severity: "STANDARD",
      status: "OPEN",
      daysOutstanding: 2,
      requestedByUserId: analystUser.id,
      lastContactedChannel: "EMAIL",
      lastContactedAt: new Date("2026-03-19T17:00:00Z"),
    },
  });

  await prisma.outstandingItem.create({
    data: {
      applicationId: app1.id,
      title: "Pro-forma Machinery Invoice Missing",
      description: "Vendor quotation for precision component CNC machine needed to verify Capex disbursement schedule.",
      category: "FINANCIAL_STATEMENTS",
      severity: "STANDARD",
      status: "OPEN",
      daysOutstanding: 5,
      requestedByUserId: analystUser.id,
      lastContactedChannel: "EMAIL",
      lastContactedAt: new Date("2026-03-18T14:00:00Z"),
    },
  });

  await prisma.outstandingItem.create({
    data: {
      applicationId: app1.id,
      title: "Existing Lender Sanction Letters",
      description: "Provide sanction letters and conduct letters from existing primary current account banker.",
      category: "SANCTION_LETTERS",
      severity: "LOW",
      status: "OPEN",
      daysOutstanding: 4,
      requestedByUserId: analystUser.id,
      lastContactedChannel: "SMS",
      lastContactedAt: new Date("2026-03-18T11:00:00Z"),
    },
  });

  // App 4 (Apex Zenith) - Critical 14 days overdue item from the design
  await prisma.outstandingItem.create({
    data: {
      applicationId: app4.id,
      title: "Audited FY25 Annual Report & Fleet Invoices",
      description: "EV Commercial fleet purchase invoices and certified balance sheet overdue by 14 days.",
      category: "FINANCIAL_STATEMENTS",
      severity: "CRITICAL",
      status: "OPEN",
      daysOutstanding: 14,
      requestedByUserId: analystUser.id,
      lastContactedChannel: "WHATSAPP",
      lastContactedAt: new Date("2026-03-18T09:00:00Z"),
    },
  });

  // 7. Financial Extractions for App 1 (Sample Applicant Pvt Ltd)
  const extractions = [
    {
      metricKey: "TOTAL_REVENUE",
      label: "Total Revenue from Operations (FY24-25)",
      extractedValue: "₹ 4,82,50,000",
      numericValue: 48250000,
      unit: "INR",
      sourceDocumentName: "FY24_25_Audited_Accounts_Sample.pdf",
      sourceCitation: "Page 4, line 12 (audited_finances.pdf)",
      confidence: 0.994,
      status: "ACCEPTED",
    },
    {
      metricKey: "OPERATING_EBITDA",
      label: "Operating EBITDA",
      extractedValue: "₹ 68,40,000",
      numericValue: 6840000,
      unit: "INR",
      sourceDocumentName: "FY24_25_Audited_Accounts_Sample.pdf",
      sourceCitation: "Page 6, line 8 (audited_finances.pdf)",
      confidence: 0.985,
      status: "ACCEPTED",
    },
    {
      metricKey: "CLOSING_BANK_BALANCE",
      label: "Closing Bank Balance",
      extractedValue: "₹ 12,45,000",
      numericValue: 1245000,
      unit: "INR",
      sourceDocumentName: "HDFC_Bank_Stmt_Apr25_Mar26.pdf",
      sourceCitation: "Bank Statement Pg 18 (hdfc_stmt_consolidated.pdf)",
      confidence: 0.998,
      status: "ACCEPTED",
    },
    {
      metricKey: "DSCR",
      label: "Debt Service Coverage Ratio (DSCR)",
      extractedValue: "1.68x",
      numericValue: 1.68,
      unit: "x",
      sourceDocumentName: "cma_model_v2.xlsx",
      sourceCitation: "CMA Data sheet, line 24 (cma_model_v2.xlsx)",
      confidence: 0.975,
      status: "ACCEPTED",
    },
    {
      metricKey: "CURRENT_RATIO",
      label: "Current Ratio",
      extractedValue: "1.42",
      numericValue: 1.42,
      unit: "ratio",
      sourceDocumentName: "cma_model_v2.xlsx",
      sourceCitation: "CMA pg 2, balance col D",
      confidence: 0.98,
      status: "ACCEPTED",
    },
    {
      metricKey: "GST_RECONCILIATION",
      label: "GSTR-3B vs Financial Turnover Reconciliation",
      extractedValue: "99.8% Match",
      numericValue: 99.8,
      unit: "%",
      sourceDocumentName: "GSTR_3B_Consolidated_2025.zip",
      sourceCitation: "GSTR-3B vs CA P&L Schedule 4",
      confidence: 0.965,
      status: "EDITED",
      editedValue: "99.8% Match (Reconciled with ₹ 82,000 timing variance)",
      analystComment: "Minor timing difference between March invoice date and April GSTR-1 credit date. Satisfactorily explained by CA.",
    },
    {
      metricKey: "TOTAL_DEBT",
      label: "Total Bank Borrowings & Secured Debt",
      extractedValue: "₹ 1,45,00,000",
      numericValue: 14500000,
      unit: "INR",
      sourceDocumentName: "audited_finances.pdf",
      sourceCitation: "Schedule V: Long-Term Borrowings",
      confidence: 0.96,
      status: "PENDING",
    },
    {
      metricKey: "NET_TANGIBLE_WORTH",
      label: "Net Tangible Worth",
      extractedValue: "₹ 3,18,00,000",
      numericValue: 31800000,
      unit: "INR",
      sourceDocumentName: "audited_finances.pdf",
      sourceCitation: "Balance Sheet: Share Capital + Free Reserves less Fictitious Assets",
      confidence: 0.95,
      status: "PENDING",
    },
  ];

  for (const ext of extractions) {
    await prisma.financialExtraction.create({
      data: {
        applicationId: app1.id,
        ...ext,
      },
    });
  }

  // 8. Analyst Notes
  await prisma.analystNote.create({
    data: {
      applicationId: app1.id,
      authorId: analystUser.id,
      title: "GSTR-3B and P&L Reconciliation Clearance",
      content: "Turnover variance of 0.2% between GSTR-3B filing and audited P&L statement represents year-end job work adjustments. Well within statutory 1.0% threshold.",
      category: "COMPLIANCE",
    },
  });

  await prisma.analystNote.create({
    data: {
      applicationId: app1.id,
      authorId: analystUser.id,
      title: "Debt Service Capacity Review",
      content: "DSCR of 1.68x provides comfortable cushion over internal benchmark minimum of 1.35x. Working capital cycle is currently 62 days.",
      category: "FINANCIAL_SPREAD",
    },
  });

  // 9. Initial Audit Events
  await prisma.auditEvent.create({
    data: {
      applicationId: app1.id,
      userId: rmUser.id,
      userRole: "RM",
      action: "APPLICATION_CREATED",
      summary: "Created lending application APP-2026-0001 for Sample Applicant Pvt Ltd (₹ 18 Lakhs).",
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: app1.id,
      userId: rmUser.id,
      userRole: "RM",
      action: "DOCUMENT_UPLOADED",
      summary: "Uploaded Audited Financial Statements (FY24-25). SHA-256 verified.",
    },
  });

  console.log("Database seeded successfully with all realistic scenarios!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
