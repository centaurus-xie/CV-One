# CV-One MVP PRD

## 1. Product Overview

**CV-One** is an AI job-search narrative tool that helps users turn fragmented career history into a coherent, defensible professional story.

The MVP focuses on four jobs-to-be-done:

1. Structure past experiences into a normalized career record
2. Build a logically consistent career narrative
3. Tailor a resume to a specific job description and company preference
4. Generate likely interview follow-up questions with draft answers grounded in the user’s real history

The core differentiation is **narrative coherence**. CV-One is not just a resume rewriter. It is a system that helps users, especially those moving from technical roles into product roles, explain:
- why their background makes sense,
- how their experiences connect,
- what gaps or transitions need framing,
- and how to defend that story in interviews.

The system must never invent experience. All outputs must be derived from user-provided inputs and remain interview-defensible.

---

## 2. Target Users

### Primary User
People transitioning from **technical roles to product roles**, including:
- Software engineers moving into product management
- Data/analytics professionals moving into product roles
- Technical founders or builders repositioning for product jobs
- Hybrid operators with unclear positioning who need a stronger narrative

### Secondary User
Early- to mid-career candidates who have:
- non-linear career paths,
- overlapping responsibilities across roles,
- weak resume storytelling,
- or difficulty aligning past work to a target role.

---

## 3. Core Pain Points

- Users have real experience but cannot explain it as a clear career story.
- Resumes often list tasks instead of showing progression, decision-making, and product relevance.
- Career transitions create narrative gaps:
  - “Why are you moving from engineering to product?”
  - “Do you actually have product experience?”
  - “How does this role fit your background?”
- Generic AI resume tools optimize keywords but not logical consistency.
- Users struggle to predict interview scrutiny and prepare defensible answers.
- Tailoring for each role is slow and often breaks consistency across resume and interview prep.

---

## 4. MVP Scope

### In Scope
The MVP will support:

1. **Experience Intake and Structuring**
   - Collect user work history, projects, responsibilities, outcomes, and skills
   - Normalize inputs into a structured experience model
   - Preserve evidence and source grounding

2. **Career Narrative Planning**
   - Analyze user background and target role
   - Produce a clear narrative plan:
     - positioning statement,
     - transition logic,
     - supporting themes,
     - strengths to emphasize,
     - risks/gaps to address carefully

3. **Resume Tailoring**
   - Generate a role-specific resume variant from the structured experience and narrative plan
   - Align language to the job description and likely company preferences
   - Emphasize truthful, relevant, defensible experience only

4. **Interview Follow-up Preparation**
   - Generate likely interviewer questions based on the tailored resume and narrative
   - Draft grounded answer outlines based only on user-provided experience
   - Highlight areas where the user may need stronger evidence or clarification

### Strict Scope Limits
- Single-user workflow
- One target job at a time
- Resume output only, not full job-application suite
- Text generation and structured planning only
- Human-in-the-loop editing assumed

---

## 5. Key User Flows

### Flow 1: Build Career Foundation
1. User inputs work history, projects, accomplishments, and context
2. System structures the data into standardized experiences
3. System identifies:
   - transferable product signals,
   - progression themes,
   - transition risks,
   - missing evidence areas
4. System produces a first-pass narrative plan

### Flow 2: Tailor to a Specific Job
1. User provides a target JD and optional company notes
2. System analyzes required skills, responsibilities, and narrative expectations
3. System maps user experiences to the target role
4. System generates a tailored resume variant grounded in the narrative plan

### Flow 3: Prepare for Interview Defense
1. System reviews the resume variant and transition narrative
2. System generates likely follow-up questions
3. System drafts answer outlines using only the user’s real experiences
4. System flags weak points where claims may be hard to defend

---

## 6. Functional Modules

### 1. Experience Structuring Module
Purpose:
Convert raw user history into consistent structured records.

Responsibilities:
- Capture roles, time periods, projects, responsibilities, outcomes, tools, and evidence
- Distinguish facts from interpretation
- Preserve source text for traceability

### 2. Narrative Engine
Purpose:
Build a coherent and defensible career story.

Responsibilities:
- Infer themes across experiences
- Explain role transitions logically
- Identify product-relevant behaviors from technical work
- Create a positioning narrative for target roles
- Surface contradictions, gaps, and risky claims

### 3. Job Target Analyzer
Purpose:
Understand the target role and what the employer likely values.

Responsibilities:
- Parse JD into responsibilities, signals, and likely expectations
- Identify company preference cues if provided by user
- Detect overlap between target role and user history

### 4. Resume Variant Generator
Purpose:
Create a role-specific resume grounded in the narrative plan.

Responsibilities:
- Select relevant experiences
- Reframe bullets toward target role relevance
- Preserve truthfulness and defensibility
- Avoid overclaiming or unsupported product ownership

### 5. Interview Prep Generator
Purpose:
Help users defend the story the resume tells.

Responsibilities:
- Generate likely interviewer questions
- Draft evidence-based answer outlines
- Tie answers back to specific experiences
- Mark where the user lacks supporting evidence

### 6. Consistency Guardrails
Purpose:
Protect coherence and trustworthiness across outputs.

Responsibilities:
- Prevent fake experience generation
- Check resume bullets against source experience
- Check interview answers against actual evidence
- Flag unsupported claims, inflated scope, and inconsistent timelines

---

## 7. Non-Goals

The MVP will **not** include:

- Job board aggregation or application tracking
- Automatic job applying
- Networking outreach generation
- Cover letter generation
- Portfolio or personal website generation
- Multi-language support
- Collaboration or recruiter-facing portals
- Visual resume design optimization
- Deep company intelligence or market research
- Fabrication, embellishment, or gap-filling of missing experience
- Coaching for experiences the user cannot substantiate

These are intentionally excluded to keep the MVP focused on **narrative quality and defensibility**.

---

## 8. Success Metrics

### Primary Metrics
- Percentage of generated resume bullets traceable to user-provided evidence
- Percentage of narrative claims that pass internal consistency checks
- User-rated confidence that they can defend the generated story in interview
- User-rated relevance of tailored resume to target JD

### Secondary Metrics
- Time from raw experience input to first usable resume variant
- Percentage of generated interview questions judged “likely” by users
- Percentage of answer drafts judged “truthful and usable” by users
- Repeat usage across multiple target jobs by the same user

### Qualitative Success Signal
Users transitioning from technical to product roles should say:
“I can now explain why this move makes sense, and I can defend it.”

---

## 9. Core Data Model

### Experience
Represents one role, project, or meaningful experience unit.

Key fields:
- `id`
- `type` (`role`, `project`, `initiative`)
- `title`
- `organization`
- `startDate`
- `endDate`
- `location` optional
- `summary`
- `responsibilities[]`
- `outcomes[]`
- `skills[]`
- `tools[]`
- `evidenceNotes[]`
- `sourceText`
- `confidenceLevel` for completeness, not truth

### NarrativePlan
Represents the strategic interpretation of the user’s background.

Key fields:
- `id`
- `targetRole`
- `targetCompanyContext` optional
- `positioningStatement`
- `careerStorySummary`
- `transitionLogic`
- `coreThemes[]`
- `strengthsToEmphasize[]`
- `risksToAddress[]`
- `claimsToAvoid[]`
- `evidenceGaps[]`

### JobTarget
Represents the target job definition.

Key fields:
- `id`
- `jobTitle`
- `company`
- `jobDescriptionRaw`
- `responsibilities[]`
- `requirements[]`
- `preferenceSignals[]`
- `roleKeywords[]`

### ResumeVariant
Represents one tailored resume output.

Key fields:
- `id`
- `jobTargetId`
- `narrativePlanId`
- `selectedExperiences[]`
- `summary`
- `experienceBullets[]`
- `skillsSection[]`
- `tailoringNotes`
- `traceabilityMap` linking bullets to source experiences

### InterviewQuestionSet
Represents likely interview scrutiny for a resume variant.

Key fields:
- `id`
- `resumeVariantId`
- `questions[]`

### InterviewAnswerDraft
Represents draft responses grounded in actual experience.

Key fields:
- `id`
- `question`
- `answerOutline`
- `supportingExperienceIds[]`
- `riskFlags[]`
- `userReviewStatus`

### ConsistencyCheck
Represents validation findings.

Key fields:
- `id`
- `entityType`
- `entityId`
- `issueType` (`unsupported_claim`, `timeline_conflict`, `scope_inflation`, `unclear_transition`)
- `severity`
- `message`
- `relatedExperienceIds[]`

---

## 10. System Architecture Proposal

### High-Level Architecture

#### 1. Input Layer
Handles:
- user-entered experience data
- imported raw career notes
- target JD and optional company context

#### 2. Structured Profile Layer
Stores normalized career data as structured entities such as:
- `Experience`
- `JobTarget`

This becomes the source of truth for downstream generation.

#### 3. Narrative Reasoning Layer
Core intelligence layer that:
- synthesizes experiences,
- builds transition logic,
- evaluates defensibility,
- and produces `NarrativePlan`.

This is the most important layer in the MVP.

#### 4. Output Generation Layer
Uses the structured profile + narrative plan to generate:
- `ResumeVariant`
- `InterviewQuestionSet`
- `InterviewAnswerDraft`

#### 5. Consistency and Safety Layer
Runs checks across all generated outputs to ensure:
- no fabricated experience,
- no unsupported claims,
- no contradictory story across resume and interview prep.

#### 6. Persistence Layer
Stores user inputs, structured entities, generated artifacts, and consistency checks for iterative refinement.

### Design Principle for Architecture
The system should be **grounded-first, generation-second**:
- first structure facts,
- then form narrative,
- then generate outputs,
- then validate defensibility.

This ordering is essential to CV-One’s differentiation.

---

## MVP Summary

CV-One MVP is a narrowly scoped AI tool for turning real career history into a consistent, interview-defensible narrative for job search. Its value is highest for technical candidates moving into product roles, where the main challenge is not lack of experience alone, but lack of a clear, credible story connecting past work to future fit.