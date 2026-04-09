# CV-One API Interface Document

This document describes the current MVP-facing API contracts for CV-One. The scope is limited to the implemented backend modules and does not introduce any new business logic.

## Conventions

- Base path: `/api`
- Content type: `application/json`
- All IDs are opaque strings
- Dates in request/response payloads are ISO strings where applicable
- Guardrails:
  - `TRACEABILITY` and `RULE_ENGINE` findings are blocking
  - `LLM_ASSIST` findings are advisory only

---

## 1. Parse Experience

### `POST /api/experience/parse`

Convert raw experience text or structured form data into `Experience[]`.

### Request

```json
{
  "rawText": "Senior Engineer at Acme\nJan 2022 - Present\nLed integration work across design and engineering...\nImproved conversion by 12%...",
  "formData": [
    {
      "type": "ROLE",
      "title": "Product Engineer",
      "organization": "Acme",
      "startDate": "2022-01",
      "endDate": null,
      "summary": "Worked on internal tooling",
      "responsibilities": ["Partnered with PMs", "Built tooling"],
      "outcomes": ["Reduced review time by 30%"],
      "skills": ["TypeScript", "Analytics"],
      "evidenceNotes": ["Source snippet: worked with PM team"],
      "sourceText": "Original user-provided source"
    }
  ]
}
```

### Response

```json
[
  {
    "id": "exp_123",
    "type": "ROLE",
    "title": "Senior Engineer",
    "organization": "Acme",
    "startDate": "2022-01-01T00:00:00.000Z",
    "endDate": null,
    "location": null,
    "summary": "Led integration work across design and engineering.",
    "responsibilities": ["Led integration work across design and engineering"],
    "outcomes": ["Improved conversion by 12%"],
    "skills": ["analytics", "stakeholder"],
    "tools": [],
    "evidenceNotes": ["Source snippet: Led integration work across design and engineering."],
    "sourceText": "Senior Engineer at Acme Jan 2022 - Present ...",
    "confidenceLevel": 0.78
  }
]
```

---

## 2. Analyze Job Target

### `POST /api/job-target/analyze`

Transform a JD into strategy data for narrative planning.

### Request

```json
{
  "jobDescriptionRaw": "Senior Product Manager\nResponsibilities\n- Drive roadmap...\nRequirements\n- 5+ years...",
  "companyNotes": "Series B SaaS company. Likely values 0-to-1 ownership and collaboration.",
  "experiences": []
}
```

### Response

```json
{
  "jobTarget": {
    "id": "jt_123",
    "jobTitle": "Senior Product Manager",
    "company": "Series B SaaS company. Likely values 0-to-1 ownership and collaboration.",
    "jobDescriptionRaw": "Senior Product Manager ...",
    "responsibilities": ["Drive roadmap"],
    "requirements": ["5+ years experience"],
    "preferenceSignals": ["Likely values ownership in ambiguous or early-stage environments."],
    "roleKeywords": ["product", "roadmap", "metrics"],
    "sourceText": "Senior Product Manager ..."
  },
  "narrativeAdjustmentStrategy": {
    "id": "nas_123",
    "jobTargetId": "jt_123",
    "emphasizePoints": ["Emphasize product-adjacent work..."],
    "downplayPoints": ["Downplay implementation-only detail..."],
    "transitionAngles": ["Frame the transition as an expansion from execution depth into product judgment and decision ownership."],
    "roleFitHypotheses": ["Platform migration work can support role fit because it overlaps with roadmap, metrics."],
    "sourceText": "Senior Product Manager ..."
  },
  "experienceMatchHints": {
    "primaryMatches": [],
    "supportingMatches": [],
    "optionalMatches": []
  }
}
```

---

## 3. Build Narrative Pipeline

### `POST /api/narrative/build`

Run the multi-stage narrative pipeline and persist intermediate outputs.

### Request

```json
{
  "experiences": [],
  "jobTarget": {},
  "narrativeAdjustmentStrategy": {},
  "experienceMatchHints": {
    "primaryMatches": [],
    "supportingMatches": [],
    "optionalMatches": []
  }
}
```

### Response

```json
{
  "experienceSignals": [
    {
      "id": "sig_1",
      "experienceId": "exp_1",
      "signalType": "cross_functional_collaboration",
      "signalText": "Platform Engineer shows cross-functional collaboration across teams or stakeholders.",
      "evidenceRefs": ["Partnered with design and PM"],
      "confidence": 0.7,
      "sourceText": "Original source text"
    }
  ],
  "narrativeThemes": [
    {
      "id": "theme_1",
      "themeName": "Cross Functional Collaboration",
      "description": "A recurring pattern of cross functional collaboration appears across the supporting experiences.",
      "supportingSignalIds": ["sig_1"],
      "supportingExperienceIds": ["exp_1"],
      "sourceText": "Original source text"
    }
  ],
  "transitionLogicNode": {
    "id": "tl_1",
    "jobTargetId": "jt_1",
    "logicSummary": "The candidate is best positioned...",
    "supportingThemeIds": ["theme_1"],
    "riskPoints": [],
    "missingLinks": [],
    "sourceText": "..."
  },
  "narrativePlan": {
    "id": "np_1",
    "jobTargetId": "jt_1",
    "transitionLogicId": "tl_1",
    "positioningStatement": "Position the candidate for Senior Product Manager through grounded strengths...",
    "careerStorySummary": "Position the candidate...",
    "transitionLogic": "The candidate is best positioned...",
    "coreThemes": ["Cross Functional Collaboration"],
    "strengthsToEmphasize": ["Emphasize measurable outcomes..."],
    "downplayPoints": ["Downplay implementation-only detail..."],
    "risksToAddress": [],
    "claimsToAvoid": ["Avoid overstating..."],
    "evidenceGaps": [],
    "supportingExperienceIds": ["exp_1"],
    "sourceText": "..."
  }
}
```

---

## 4. Generate Resume Variant

### `POST /api/resume/generate`

Generate a tailored resume variant from `Experience[]`, `JobTarget`, and `NarrativePlan`.

### Request

```json
{
  "experiences": [],
  "jobTarget": {},
  "narrativePlan": {}
}
```

### Response

```json
{
  "resumeVariant": {
    "id": "rv_1",
    "narrativePlanId": "np_1",
    "summary": "Position the candidate for Senior Product Manager...",
    "experienceBullets": ["Improved conversion by 12% through..."],
    "skillsSection": ["TypeScript", "Analytics"],
    "tailoringNotes": ["Tailored for Senior Product Manager."],
    "traceabilityMap": {
      "bullets": [
        {
          "bulletId": "bullet_1",
          "experienceId": "exp_1",
          "sourceText": "Original experience source",
          "evidenceRefs": ["Source snippet: ..."]
        }
      ]
    },
    "sourceText": "Original experience source",
    "selectedExperienceIds": ["exp_1"]
  },
  "traceabilityMap": {
    "bullets": [
      {
        "bulletId": "bullet_1",
        "experienceId": "exp_1",
        "sourceText": "Original experience source",
        "evidenceRefs": ["Source snippet: ..."]
      }
    ]
  },
  "consistencyChecks": []
}
```

### Blocking behavior

- If traceability or rule-based guardrails fail, the endpoint returns an error instead of a valid resume payload.

---

## 5. Generate Interview Prep

### `POST /api/interview/generate`

Generate likely interview follow-up questions and grounded answer drafts.

### Request

```json
{
  "resumeVariant": {},
  "narrativePlan": {},
  "experiences": []
}
```

### Response

```json
{
  "interviewQuestionSet": {
    "id": "iqs_1",
    "resumeVariantId": "rv_1",
    "questions": [
      "Can you walk me through the context behind \"Improved conversion by 12%...\" and what your specific contribution was?"
    ],
    "sourceText": "HIGH_RISK_BULLET: ..."
  },
  "interviewAnswerDrafts": [
    {
      "id": "iad_1",
      "question": "Can you walk me through the context behind ...",
      "answerOutline": "Start by answering the question directly...",
      "supportingExperienceIds": ["exp_1"],
      "riskFlags": ["metrics_defense"],
      "userReviewStatus": null,
      "sourceText": "Original experience source"
    }
  ]
}
```

### Blocking behavior

- If traceability or rule-based guardrails fail, the endpoint returns an error instead of a valid interview prep payload.

---

## 6. Run Consistency Guardrails

### `POST /api/consistency/check`

Run traceability, rule-engine, and LLM-assist review across the supplied entities.

### Request

```json
{
  "experiences": [],
  "narrativePlan": {},
  "resumeVariant": {},
  "interviewAnswerDrafts": []
}
```

### Response

```json
{
  "consistencyChecks": [
    {
      "id": "cc_1",
      "entityType": "ResumeVariant",
      "entityId": "rv_1",
      "issueType": "SCOPE_INFLATION",
      "severity": "HIGH",
      "message": "Resume bullet \"...\" overstates ownership beyond the source experience.",
      "relatedExperienceIds": ["exp_1"],
      "checkSource": "RULE_ENGINE",
      "sourceText": "..."
    }
  ],
  "blocked": true
}
```

### Interpretation

- `blocked = true`
  - At least one `TRACEABILITY` or `RULE_ENGINE` issue exists
  - Output should not be treated as safe for downstream use
- `blocked = false`
  - No blocking issues found
  - `LLM_ASSIST` warnings may still exist and should be reviewed manually
