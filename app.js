const AGENTS = [
  {
    title: "Parse Claim",
    description: "Extract procedure code, diagnosis code, billed amount, provider, and date of service."
  },
  {
    title: "Retrieve Patient Context",
    description: "Pull clinical notes, prior visits, medication history, lab results, and prior claim signals."
  },
  {
    title: "Check Clinical Validity",
    description: "Test whether the diagnosis supports the procedure and whether treatment is guideline-consistent."
  },
  {
    title: "Check Lab and Clinical Consistency",
    description: "Compare labs, vitals, symptoms, and findings against the claimed service severity."
  },
  {
    title: "Check for Billing Anomalies",
    description: "Search for duplicate claims, unbundled codes, and upcoding versus documented complexity."
  },
  {
    title: "Check Documentation Completeness",
    description: "Confirm signed physician note, prior authorization, and required fields."
  },
  {
    title: "Synthesize and Score",
    description: "Assign a confidence score, flag failure points, and generate the reviewer report."
  }
];

const SCENARIOS = {
  mri: {
    label: "Lumbar MRI medical necessity review",
    claimId: "CLM-20391",
    procedureCode: "72148",
    diagnosisCode: "M54.50",
    billedAmount: "$1,420.00",
    provider: "Mountain View Imaging",
    dateOfService: "2026-05-14",
    clinicalNotes:
      "Patient reports lower back pain for 8 weeks with radiating pain to left leg. Conservative therapy included NSAIDs and physical therapy. No bowel/bladder dysfunction. Neurologic deficit is not documented. Physician note is electronically signed.",
    labs:
      "Vitals stable. Pain score 7/10. No recent trauma. No fever. No inflammatory markers ordered. Straight leg raise positive on left side.",
    policy:
      "Lumbar spine MRI is medically necessary when back pain persists for at least 6 weeks despite conservative therapy and when neurologic deficit, red flag symptoms, infection, cancer, fracture, or surgical planning is documented. Prior authorization is required.",
    history:
      "Prior visit 2026-04-03 for back pain. Physical therapy documented for 5 visits. No prior lumbar MRI in past 90 days. Prior authorization record is not present in the submitted package."
  },
  ekg: {
    label: "Duplicate EKG billing review",
    claimId: "CLM-20444",
    procedureCode: "93000",
    diagnosisCode: "R07.9",
    billedAmount: "$210.00",
    provider: "Canyon Family Clinic",
    dateOfService: "2026-05-21",
    clinicalNotes:
      "Patient presented with intermittent chest discomfort. EKG performed in office. Physician note is signed and includes interpretation: normal sinus rhythm, no acute ST changes.",
    labs:
      "Blood pressure 146/88. Pulse 91. Troponin not ordered in office. Oxygen saturation 98%. Symptoms resolved during visit.",
    policy:
      "Routine EKG is payable when ordered for chest pain, arrhythmia symptoms, syncope, or medication monitoring. Same-day duplicate EKG services by the same provider require modifier support or clear documentation of medical necessity.",
    history:
      "Another claim for CPT 93000 from the same provider and same date of service appears in claim history. No modifier or repeat-test rationale is documented."
  },
  upcoding: {
    label: "Upcoding complexity review",
    claimId: "CLM-20518",
    procedureCode: "99215",
    diagnosisCode: "E11.65",
    billedAmount: "$395.00",
    provider: "Summit Endocrinology",
    dateOfService: "2026-05-28",
    clinicalNotes:
      "Follow-up for diabetes management. Medication adherence discussed. A1c reviewed. Total visit time documented as 28 minutes. Medical decision-making notes list one chronic condition with medication adjustment. Physician note is signed.",
    labs:
      "A1c 9.2%. Glucose 212 mg/dL. Creatinine 1.0 mg/dL. Blood pressure 132/84. Weight stable.",
    policy:
      "High-complexity established patient E/M coding requires high medical decision-making or total time of 40 minutes or more. Moderate complexity may be supported by prescription drug management and uncontrolled chronic illness.",
    history:
      "Prior office visit 2026-04-25 coded 99214. Medication history includes metformin and GLP-1 therapy. Prior authorization on file is not required for this office visit."
  },
  cleanColonoscopy: {
    label: "High-confidence preventive colonoscopy",
    claimId: "CLM-20571",
    procedureCode: "45378",
    diagnosisCode: "Z12.11",
    billedAmount: "$980.00",
    provider: "North Valley GI Center",
    dateOfService: "2026-06-02",
    clinicalNotes:
      "Screening colonoscopy performed for average-risk patient age 52. No symptoms reported. Procedure note is signed and includes cecal intubation, bowel prep quality, findings, and discharge plan.",
    labs:
      "Vitals stable before and after procedure. No abnormal labs required for routine screening. No complications documented.",
    policy:
      "Average-risk colorectal cancer screening colonoscopy is covered for adults age 45 and older when documentation includes procedure report, indication for screening, and signed physician attestation. Prior authorization is not required.",
    history:
      "No prior colonoscopy claim in past 10 years. Preventive screening benefit active. No duplicate claim found. Prior authorization on file is not required for this preventive service."
  },
  authMissingTherapy: {
    label: "Physical therapy missing authorization",
    claimId: "CLM-20602",
    procedureCode: "97110",
    diagnosisCode: "M25.561",
    billedAmount: "$165.00",
    provider: "Peak Motion Therapy",
    dateOfService: "2026-06-06",
    clinicalNotes:
      "Therapeutic exercises performed for right knee pain after injury. Treatment plan lists strengthening and range-of-motion goals. Therapist note is signed.",
    labs:
      "No labs required. Knee range of motion reduced. Pain score 5/10. Gait mildly antalgic.",
    policy:
      "Outpatient therapy is payable when a signed plan of care is present and prior authorization is required after the initial evaluation for ongoing therapy visits.",
    history:
      "Initial evaluation occurred 2026-05-22. This is visit 6. Prior authorization record is not present in the submitted package. No duplicate therapy claim found."
  },
  unbundledPanel: {
    label: "Potential unbundled lab panel",
    claimId: "CLM-20648",
    procedureCode: "80053 + 82247",
    diagnosisCode: "R53.83",
    billedAmount: "$148.00",
    provider: "Metro Diagnostic Labs",
    dateOfService: "2026-06-08",
    clinicalNotes:
      "Patient evaluated for fatigue. Physician note is signed. Comprehensive metabolic panel ordered to evaluate liver, kidney, and electrolyte status.",
    labs:
      "CMP resulted with glucose, calcium, albumin, total protein, sodium, potassium, chloride, CO2, BUN, creatinine, alkaline phosphatase, ALT, AST, and bilirubin.",
    policy:
      "When a comprehensive metabolic panel is billed, component tests included in the panel should not be separately billed unless distinct medical necessity and modifier support are documented.",
    history:
      "Same date claim includes CMP code 80053 and separate bilirubin code 82247 from the same provider. No modifier or distinct-test documentation is present."
  },
  missingSignature: {
    label: "Missing signed physician note",
    claimId: "CLM-20677",
    procedureCode: "20610",
    diagnosisCode: "M17.11",
    billedAmount: "$310.00",
    provider: "Lakeside Orthopedics",
    dateOfService: "2026-06-10",
    clinicalNotes:
      "Right knee injection documented for osteoarthritis. Medication, dose, site, and tolerance are listed. Draft note is present but physician signature is absent.",
    labs:
      "No labs required. Right knee swelling and limited range of motion documented. Pain score 6/10.",
    policy:
      "Joint injection services require procedure documentation, medication details, diagnosis support, and a signed physician or qualified provider note.",
    history:
      "No duplicate injection claim found in prior 90 days. Prior authorization on file is not required. Medication history includes NSAID trial."
  },
  mismatchImaging: {
    label: "Diagnosis-procedure mismatch",
    claimId: "CLM-20704",
    procedureCode: "70450",
    diagnosisCode: "M25.511",
    billedAmount: "$760.00",
    provider: "Regional Imaging Associates",
    dateOfService: "2026-06-12",
    clinicalNotes:
      "Patient complains of right shoulder pain after lifting boxes. Exam documents shoulder tenderness and reduced abduction. Physician note is signed. No headache, trauma to head, neurologic deficit, or altered mental status documented.",
    labs:
      "Vitals stable. No abnormal neurologic findings documented. Shoulder exam positive for impingement signs.",
    policy:
      "CT head without contrast is medically necessary for head trauma, acute neurologic deficit, severe headache red flags, altered mental status, or other documented intracranial concern.",
    history:
      "No prior CT head claim in past 90 days. No duplicate claim found. Prior authorization record is not present in the submitted package."
  }
};

const FIELD_IDS = [
  "claimId",
  "procedureCode",
  "diagnosisCode",
  "billedAmount",
  "provider",
  "dateOfService",
  "clinicalNotes",
  "labs",
  "policy",
  "history"
];

const STATUS_LABELS = {
  pass: "Passed",
  warn: "Needs review",
  fail: "Flagged",
  neutral: "Ready"
};

const UI = {
  scenarioSelect: document.querySelector("#scenarioSelect"),
  runButton: document.querySelector("#runButton"),
  copyButton: document.querySelector("#copyButton"),
  agentTimeline: document.querySelector("#agentTimeline"),
  scoreMetric: document.querySelector("#scoreMetric"),
  riskMetric: document.querySelector("#riskMetric"),
  scoreValue: document.querySelector("#scoreValue"),
  recommendationBadge: document.querySelector("#recommendationBadge"),
  reportTitle: document.querySelector("#reportTitle"),
  reportSummary: document.querySelector("#reportSummary"),
  failureList: document.querySelector("#failureList"),
  evidenceList: document.querySelector("#evidenceList"),
  reportText: document.querySelector("#reportText")
};

FIELD_IDS.forEach((id) => {
  UI[id] = document.querySelector(`#${id}`);
});

function init() {
  renderScenarioOptions();
  bindEvents();
  loadScenario("mri");
}

function renderScenarioOptions() {
  UI.scenarioSelect.innerHTML = Object.entries(SCENARIOS)
    .map(([key, scenario]) => `<option value="${key}">${escapeHtml(scenario.label)}</option>`)
    .join("");
}

function bindEvents() {
  UI.scenarioSelect.addEventListener("change", (event) => loadScenario(event.target.value));
  UI.runButton.addEventListener("click", runInvestigation);
  UI.copyButton.addEventListener("click", copyReport);
}

function loadScenario(key) {
  const scenario = SCENARIOS[key];

  FIELD_IDS.forEach((field) => {
    UI[field].value = scenario[field] || "";
  });

  renderEmptyState();
}

function getClaimFromForm() {
  return FIELD_IDS.reduce((claim, field) => {
    claim[field] = UI[field].value.trim();
    return claim;
  }, {});
}

function runInvestigation() {
  const claim = getClaimFromForm();
  const result = investigateClaim(claim);
  renderReport(claim, result);
}

function investigateClaim(claim) {
  const context = buildContext(claim);
  const findings = createFindings(claim);

  runUniversalChecks(claim, context, findings);
  runProcedureChecks(claim, context, findings);

  const score = calculateScore(findings.adjustments);
  const severity = getSeverity(findings.failures.length, score);
  const recommendation = getRecommendation(severity);
  const agentResults = buildAgentResults(claim, context, findings, score);

  return {
    score,
    severity,
    recommendation,
    agentResults,
    failures: findings.failures,
    evidence: findings.evidence
  };
}

function buildContext(claim) {
  const allText = normalize(
    `${claim.clinicalNotes} ${claim.labs} ${claim.policy} ${claim.history}`
  );
  const notes = normalize(claim.clinicalNotes);
  const labs = normalize(claim.labs);
  const policy = normalize(claim.policy);
  const history = normalize(claim.history);

  return {
    allText,
    notes,
    labs,
    policy,
    history,
    hasSignedNote:
      notes.includes("signed") &&
      !notes.includes("signature is absent") &&
      !notes.includes("signature is missing") &&
      !notes.includes("not signed"),
    priorAuthRequired: policy.includes("prior authorization") || policy.includes("prior auth"),
    priorAuthMissing:
      history.includes("prior authorization record is not present") ||
      history.includes("prior auth record is not present"),
    duplicateSignal:
      history.includes("another claim") ||
      history.includes("duplicate claim detected") ||
      history.includes("same date claim"),
    noDuplicateSignal:
      history.includes("no prior") ||
      history.includes("no duplicate claim found") ||
      history.includes("no duplicate service"),
    conservativeTherapy: allText.includes("conservative") || allText.includes("physical therapy"),
    severitySignal:
      labs.includes("a1c 9") ||
      labs.includes("glucose 212") ||
      labs.includes("pain score 7") ||
      labs.includes("pain score 6") ||
      labs.includes("range of motion reduced") ||
      labs.includes("positive")
  };
}

function createFindings(claim) {
  return {
    failures: [],
    evidence: [
      `Parsed claim ${claim.claimId} for procedure ${claim.procedureCode} linked to diagnosis ${claim.diagnosisCode}.`
    ],
    adjustments: []
  };
}

function addEvidence(findings, text, points = 0) {
  findings.evidence.push(text);
  if (points) findings.adjustments.push(points);
}

function addFailure(findings, text, points) {
  findings.failures.push(text);
  findings.adjustments.push(points);
}

function runUniversalChecks(claim, context, findings) {
  if (!claim.procedureCode || !claim.diagnosisCode || !claim.dateOfService || !claim.provider) {
    addFailure(findings, "Required claim fields are incomplete.", -18);
  }

  if (!context.hasSignedNote) {
    addFailure(findings, "Signed physician note was not found.", -13);
  }

  if (context.priorAuthRequired && context.priorAuthMissing) {
    addFailure(
      findings,
      "Prior authorization is required by policy but is missing from the submitted package.",
      -12
    );
  }

  if (context.noDuplicateSignal && !context.duplicateSignal) {
    addEvidence(findings, "No duplicate service found in the provided prior-claim context.", 4);
  }
}

function runProcedureChecks(claim, context, findings) {
  const code = normalize(claim.procedureCode);
  const handlers = [
    [code.includes("72148"), checkLumbarMri],
    [code.includes("93000"), checkEkg],
    [code.includes("99215"), checkHighComplexityVisit],
    [code.includes("45378"), checkPreventiveColonoscopy],
    [code.includes("97110"), checkPhysicalTherapy],
    [code.includes("80053") || code.includes("82247"), checkLabUnbundling],
    [code.includes("20610"), checkJointInjection],
    [code.includes("70450"), checkCtHead]
  ];

  const handler = handlers.find(([matches]) => matches)?.[1];

  if (handler) {
    handler(claim, context, findings);
  } else {
    addEvidence(findings, "No procedure-specific rule was matched; universal checks were applied.");
  }
}

function checkLumbarMri(_claim, context, findings) {
  addEvidence(
    findings,
    "Clinical notes support persistent back pain longer than 6 weeks and conservative therapy."
  );

  if (context.notes.includes("neurologic deficit is not documented")) {
    addFailure(
      findings,
      "Policy requires neurologic deficit or red-flag documentation, but the note states neurologic deficit is not documented.",
      -14
    );
  }

  if (context.labs.includes("straight leg raise positive")) {
    addEvidence(
      findings,
      "Physical exam includes a positive straight leg raise, which supports radicular symptoms.",
      4
    );
  }
}

function checkEkg(_claim, context, findings) {
  addEvidence(findings, "Diagnosis of chest pain supports an EKG service under the policy criteria.");

  if (context.duplicateSignal) {
    addFailure(
      findings,
      "Same-day duplicate EKG claim detected without modifier support or repeat-test rationale.",
      -34
    );
  }

  if (context.notes.includes("interpretation")) {
    addEvidence(findings, "Signed interpretation is present in the clinical note.", 5);
  }
}

function checkHighComplexityVisit(_claim, context, findings) {
  addEvidence(findings, "Uncontrolled diabetes and medication adjustment support an established patient visit.");

  if (context.notes.includes("28 minutes") || context.notes.includes("one chronic condition")) {
    addFailure(
      findings,
      "Billed high-complexity E/M code is not supported by documented 28-minute visit time or MDM complexity.",
      -35
    );
  }

  if (context.severitySignal) {
    addEvidence(findings, "A1c and glucose values support active diabetes management.", 4);
  }
}

function checkPreventiveColonoscopy(_claim, context, findings) {
  addEvidence(findings, "Preventive screening indication is documented for an adult over age 45.", 6);
  addEvidence(findings, "Procedure report includes required elements and signed physician attestation.", 6);

  if (context.history.includes("no prior colonoscopy")) {
    addEvidence(findings, "No conflicting prior colonoscopy claim found in the lookback period.", 4);
  }
}

function checkPhysicalTherapy(_claim, context, findings) {
  addEvidence(findings, "Therapy note supports knee pain treatment with measurable functional goals.");

  if (context.priorAuthMissing) {
    addEvidence(
      findings,
      "Ongoing therapy visit is beyond the initial evaluation, so the missing authorization should be reviewed."
    );
  }

  if (context.labs.includes("range of motion reduced")) {
    addEvidence(findings, "Functional limitation is documented through reduced range of motion.", 3);
  }
}

function checkLabUnbundling(_claim, context, findings) {
  addEvidence(findings, "Clinical note supports ordering a comprehensive metabolic panel for fatigue workup.");

  if (context.history.includes("80053") && context.history.includes("82247")) {
    addFailure(
      findings,
      "Potential unbundling detected: bilirubin appears separately billed with comprehensive metabolic panel.",
      -32
    );
  }
}

function checkJointInjection(_claim, context, findings) {
  addEvidence(findings, "Diagnosis and procedure documentation support knee injection medical necessity.");

  if (context.notes.includes("signature is absent")) {
    addEvidence(
      findings,
      "Procedure note contains medication and site details, but the signature gap remains unresolved."
    );
  }

  if (context.labs.includes("pain score 6")) {
    addEvidence(findings, "Clinical findings include pain and limited range of motion.", 3);
  }
}

function checkCtHead(_claim, context, findings) {
  if (context.notes.includes("shoulder pain")) {
    addFailure(
      findings,
      "Diagnosis and clinical note support shoulder evaluation, not CT head medical necessity.",
      -36
    );
  }

  if (
    context.notes.includes("no headache") &&
    context.notes.includes("neurologic deficit") &&
    context.notes.includes("altered mental status")
  ) {
    addFailure(
      findings,
      "No head trauma, headache red flags, neurologic deficit, or altered mental status is documented.",
      -18
    );
  }

  addEvidence(findings, "Signed note and prior-claim context were available for review.");
}

function calculateScore(adjustments) {
  const rawScore = 86 + adjustments.reduce((total, points) => total + points, 0);
  return Math.max(0, Math.min(100, rawScore));
}

function getSeverity(failureCount, score) {
  if (failureCount === 0) return "pass";
  if (score >= 60) return "warn";
  return "fail";
}

function getRecommendation(severity) {
  const recommendations = {
    pass: "No major payment integrity issue found",
    warn: "Needs human reviewer attention",
    fail: "High-risk claim review recommended"
  };

  return recommendations[severity];
}

function buildAgentResults(claim, context, findings, score) {
  const clinicalStatus =
    findings.failures.some((failure) =>
      /medical necessity|diagnosis|complexity|head|neurologic/i.test(failure)
    )
      ? "warn"
      : "pass";

  const anomalyStatus =
    findings.failures.some((failure) => /duplicate|unbundling|upcoding|separately billed/i.test(failure))
      ? "fail"
      : "pass";

  const documentationStatus =
    findings.failures.some((failure) => /signed|authorization|required claim fields|signature/i.test(failure))
      ? "warn"
      : "pass";

  return [
    {
      status: claim.procedureCode && claim.diagnosisCode ? "pass" : "warn",
      detail: `Extracted ${claim.procedureCode || "missing procedure"} / ${claim.diagnosisCode || "missing diagnosis"} from ${claim.provider || "missing provider"}.`
    },
    {
      status: "pass",
      detail: "Clinical notes, labs, policy criteria, and prior-claim history are loaded into the investigation context."
    },
    {
      status: clinicalStatus,
      detail:
        clinicalStatus === "pass"
          ? "Diagnosis and procedure relationship appears clinically reasonable."
          : "Clinical validity requires reviewer attention based on policy or documentation mismatch."
    },
    {
      status: context.severitySignal ? "pass" : "warn",
      detail: context.severitySignal
        ? "Labs, vitals, or exam findings support the claimed severity."
        : "Available labs and vitals do not strongly establish severity; reviewer should validate context."
    },
    {
      status: anomalyStatus,
      detail:
        anomalyStatus === "pass"
          ? "No duplicate, unbundling, or upcoding signal found in the supplied context."
          : "Billing anomaly signal found in the supplied claim history or code combination."
    },
    {
      status: documentationStatus,
      detail:
        documentationStatus === "pass"
          ? "Signed note, authorization, and required fields appear complete."
          : "Documentation completeness requires reviewer attention."
    },
    {
      status: getSeverity(findings.failures.length, score),
      detail: `${score}/100 confidence. ${findings.failures.length} failure point(s) included in the reviewer handoff.`
    }
  ];
}

function renderEmptyState() {
  renderTimeline();
  UI.scoreMetric.textContent = "--";
  UI.riskMetric.textContent = "--";
  UI.scoreValue.textContent = "--";
  UI.recommendationBadge.textContent = "Not run";
  UI.recommendationBadge.className = "badge neutral";
  UI.reportTitle.textContent = "Run the investigation to generate findings.";
  UI.reportSummary.textContent =
    "The assistant will parse claim details, retrieve patient context, check clinical validity, evaluate documentation, and produce a reviewer handoff.";
  UI.failureList.innerHTML = "";
  UI.evidenceList.innerHTML = "";
  UI.reportText.textContent = "";
}

function renderReport(claim, result) {
  UI.scoreMetric.textContent = result.score;
  UI.riskMetric.textContent = result.failures.length;
  UI.scoreValue.textContent = result.score;
  UI.recommendationBadge.textContent = result.recommendation;
  UI.recommendationBadge.className = `badge ${result.severity}`;
  UI.reportTitle.textContent = `${claim.claimId}: ${result.recommendation}`;
  UI.reportSummary.textContent =
    "This POC simulates a first-pass AI investigation. The output is designed for human review, not automatic claim denial or approval.";
  UI.failureList.innerHTML = renderList(
    result.failures.length ? result.failures : ["No specific failure points found in supplied context."]
  );
  UI.evidenceList.innerHTML = renderList(result.evidence);
  UI.reportText.textContent = buildReportText(claim, result);

  renderTimeline(result.agentResults);
}

function renderTimeline(agentResults = null) {
  UI.agentTimeline.innerHTML = AGENTS.map((agent, index) => {
    const result = agentResults?.[index];
    const status = result?.status || "neutral";
    const detail = result?.detail || agent.description;

    return `
      <li class="agent-step">
        <div class="agent-number">${index + 1}</div>
        <div>
          <h3>${agent.title}</h3>
          <p>${escapeHtml(detail)}</p>
        </div>
        <span class="status-pill ${status}">${STATUS_LABELS[status]}</span>
      </li>
    `;
  }).join("");
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function buildReportText(claim, result) {
  const failureText = result.failures.length
    ? result.failures.map(numberedLine).join("\n")
    : "None identified from supplied context.";
  const evidenceText = result.evidence.map(numberedLine).join("\n");

  return `AI CLAIM INVESTIGATION ASSISTANT

Claim: ${claim.claimId}
Provider: ${claim.provider}
Date of Service: ${claim.dateOfService}
Procedure Code: ${claim.procedureCode}
Diagnosis Code: ${claim.diagnosisCode}
Billed Amount: ${claim.billedAmount}

Recommendation:
${result.recommendation}

Confidence Score:
${result.score}/100

Flagged Failure Points:
${failureText}

Supporting Evidence:
${evidenceText}

Human Reviewer Next Steps:
1. Validate cited documentation in the source record.
2. Confirm payer-specific policy requirements and code-edit rules.
3. Approve, deny, pend, or request documentation based on reviewer judgment.
4. Capture reviewer feedback so future model/rule versions can be evaluated.`;
}

function numberedLine(item, index) {
  return `${index + 1}. ${item}`;
}

async function copyReport() {
  const text = UI.reportText.textContent.trim();
  if (!text) return;

  await navigator.clipboard.writeText(text);
  UI.copyButton.textContent = "Copied";

  window.setTimeout(() => {
    UI.copyButton.textContent = "Copy Report";
  }, 1200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(text) {
  return String(text || "").toLowerCase();
}

init();
