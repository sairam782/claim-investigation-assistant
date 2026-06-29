# AI Claim Investigation Assistant

**Live Demo:** [https://claim-investigation-assistant.vercel.app](https://claim-investigation-assistant.vercel.app)

A browser-based proof of concept for a human-in-the-loop healthcare claim investigation workflow.

The app simulates how an AI assistant could help payment integrity reviewers triage submitted claims by checking claim details, clinical notes, lab and vital evidence, payer policy criteria, prior-claim history, billing anomalies, and documentation completeness.

This prototype uses synthetic data only. It does not contain protected health information, does not call an external AI service, and does not make automated claim approval or denial decisions.

## Project Purpose

Healthcare claim reviewers often need to compare a submitted claim against multiple sources of evidence:

- Procedure and diagnosis codes
- Clinical notes
- Lab results and vitals
- Insurance policy criteria
- Prior visits and prior claims
- Documentation requirements
- Billing anomaly patterns

This POC demonstrates a lightweight assistant that organizes those checks into a transparent reviewer workflow and produces a structured report.

## Workflow

The demo follows a seven-agent investigation flow:

1. **Parse Claim**  
   Extract procedure code, diagnosis code, billed amount, provider, and date of service.

2. **Retrieve Patient Context**  
   Load clinical notes, prior visits, medication history, lab results, and prior claim signals.

3. **Check Clinical Validity**  
   Determine whether the diagnosis supports the procedure and whether the treatment appears guideline-consistent.

4. **Check Lab and Clinical Consistency**  
   Compare labs, vitals, symptoms, and documented findings against the claimed service severity.

5. **Check for Billing Anomalies**  
   Flag duplicate billing, potential unbundling, and upcoding versus documented complexity.

6. **Check Documentation Completeness**  
   Confirm signed notes, prior authorization, and required claim fields.

7. **Synthesize and Score**  
   Assign a confidence score, flag failure points, and generate a structured reviewer handoff.

## Features

- No installation required
- Runs entirely in the browser
- Eight synthetic claim review scenarios
- Data-driven scenario dropdown
- Agent-by-agent status timeline
- Confidence score from 0 to 100
- Failure point list
- Supporting evidence list
- Copyable reviewer report
- Human-in-the-loop framing for safe claim review support

## Demo Scenarios

The app includes these synthetic scenarios:

1. Lumbar MRI medical necessity review
2. Duplicate EKG billing review
3. Upcoding complexity review
4. High-confidence preventive colonoscopy
5. Physical therapy missing authorization
6. Potential unbundled lab panel
7. Missing signed physician note
8. Diagnosis-procedure mismatch

The high-confidence preventive colonoscopy case demonstrates a clean claim with no major payment integrity issue found.

## How to Run

Open `index.html` directly in a browser.

You can also run a local static server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## How to Use

1. Select a scenario from the dropdown.
2. Review or edit the claim, clinical notes, labs, policy, and history fields.
3. Click **Run Investigation**.
4. Review the agent workflow, score, flags, evidence, and reviewer report.
5. Click **Copy Report** if you want to paste the report into another document.

## Technical Overview

This is a static web app built with:

- HTML
- CSS
- JavaScript

The scoring logic is deterministic and explainable. The prototype does not use a real LLM; instead, it simulates an agentic claim review workflow with transparent rules and synthetic evidence. This keeps the demo fast, easy to run, and safe to share.

## File Structure

```text
claim-investigation-assistant/
  index.html
  styles.css
  app.js
  README.md
```

## Strategic Relevance

For a payment integrity organization, this concept could support:

- Faster claim triage
- More consistent documentation review
- Early detection of duplicate billing and unbundling
- Reviewer-ready evidence summaries
- Human feedback loops for model and rule improvement
- Audit-friendly claim investigation workflows

## Limitations

This is a hackathon-style proof of concept, not a production claim review system.

Production use would require:

- Real policy version control
- Secure data handling and HIPAA-aware infrastructure
- Integration with claim, EHR, and document systems
- Validated medical necessity and coding rules
- Human reviewer audit logs
- Model evaluation and bias testing
- Clear controls preventing fully automated adverse decisions

## Future Improvements

- Add file upload for claim packets or policy documents
- Add OCR for scanned records
- Add LLM-assisted summarization with citations to source snippets
- Add policy version comparison
- Add reviewer feedback capture
- Add export to PDF or Word
- Add dashboard analytics across claim batches

## Disclaimer

This project is for demonstration and educational purposes only. It does not provide medical, legal, billing, or coverage advice.
