import type { Locale } from "@/lib/i18n/config";

type MessageSchema = {
  metadata: {
    title: string;
    description: string;
  };
  common: {
    brand: string;
    language: string;
    localeNames: {
      en: string;
      zh: string;
    };
    actions: {
      openPage: string;
    };
    emptyState: {
      noOrganization: string;
      notAvailable: string;
    };
    experienceTypes: {
      ROLE: string;
      PROJECT: string;
      INITIATIVE: string;
    };
  };
  nav: {
    experienceIntake: string;
    narrativeBuilder: string;
    resumeGenerator: string;
    interviewPrep: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    pills: string[];
    primaryAction: string;
    secondaryAction: string;
    workflowEyebrow: string;
    workflowTitle: string;
    workflowDescription: string;
    cards: {
      experienceIntake: {
        title: string;
        description: string;
      };
      narrativeBuilder: {
        title: string;
        description: string;
      };
      resumeGenerator: {
        title: string;
        description: string;
      };
      interviewPrep: {
        title: string;
        description: string;
      };
    };
  };
  pages: {
    experienceIntake: {
      eyebrow: string;
      title: string;
      description: string;
      inputTitle: string;
      outputTitle: string;
      initialStatus: string;
      parsingStatus: string;
      parsedStatus: string;
      errorStatus: string;
      rawTextLabel: string;
      rawTextHint: string;
      rawTextPlaceholder: string;
      parseButton: string;
      parsingButton: string;
      noResult: string;
      confidenceLabel: string;
      sections: {
        responsibilities: string;
        outcomes: string;
        skills: string;
        evidence: string;
      };
    };
    narrativeBuilder: {
      eyebrow: string;
      title: string;
      description: string;
      inputTitle: string;
      outputTitle: string;
      initialStatus: string;
      runningStatus: string;
      successStatus: string;
      errorStatus: string;
      jobDescriptionLabel: string;
      jobDescriptionPlaceholder: string;
      companyNotesLabel: string;
      companyNotesPlaceholder: string;
      experienceJsonLabel: string;
      experienceJsonHint: string;
      experienceJsonPlaceholder: string;
      buildButton: string;
      buildingButton: string;
      noResult: string;
      sections: {
        jobTarget: string;
        narrativeStrategy: string;
        experienceMatchHints: string;
        pipelineResult: string;
      };
    };
    resumeGenerator: {
      eyebrow: string;
      title: string;
      description: string;
      inputTitle: string;
      outputTitle: string;
      initialStatus: string;
      runningStatus: string;
      successStatus: string;
      errorStatus: string;
      experienceJsonLabel: string;
      jobTargetJsonLabel: string;
      narrativePlanJsonLabel: string;
      placeholderArray: string;
      placeholderObject: string;
      generateButton: string;
      generatingButton: string;
      noResult: string;
      sections: {
        resumeVariant: string;
        traceabilityMap: string;
        consistencyChecks: string;
      };
    };
    interviewPrep: {
      eyebrow: string;
      title: string;
      description: string;
      inputTitle: string;
      outputTitle: string;
      initialStatus: string;
      runningStatus: string;
      successStatus: string;
      errorStatus: string;
      experienceJsonLabel: string;
      resumeVariantJsonLabel: string;
      narrativePlanJsonLabel: string;
      placeholderArray: string;
      placeholderObject: string;
      generateButton: string;
      generatingButton: string;
      noResult: string;
      sections: {
        questionSet: string;
        answerDrafts: string;
      };
    };
  };
};

export const messages: Record<Locale, MessageSchema> = {
  en: {
    metadata: {
      title: "CV-One",
      description: "AI job-search narrative tool",
    },
    common: {
      brand: "CV-One",
      language: "Language",
      localeNames: {
        en: "English",
        zh: "中文",
      },
      actions: {
        openPage: "Open Page",
      },
      emptyState: {
        noOrganization: "No organization",
        notAvailable: "n/a",
      },
      experienceTypes: {
        ROLE: "Role",
        PROJECT: "Project",
        INITIATIVE: "Initiative",
      },
    },
    nav: {
      experienceIntake: "Experience Intake",
      narrativeBuilder: "Narrative Builder",
      resumeGenerator: "Resume Generator",
      interviewPrep: "Interview Prep",
    },
    home: {
      eyebrow: "Narrative Engine",
      title: "Build a defensible job-search story.",
      description:
        "CV-One turns raw experience into structured evidence, a coherent transition narrative, a tailored resume, and grounded interview prep. The UI stays intentionally simple so narrative consistency remains the priority.",
      pills: ["Monochrome system", "Narrative-first", "Interview-defensible"],
      primaryAction: "Start With Experience Intake",
      secondaryAction: "Open Narrative Builder",
      workflowEyebrow: "Workflow",
      workflowTitle: "Four MVP workspaces",
      workflowDescription:
        "Each page maps directly to an implemented backend module. There is no extra orchestration layer here yet, only thin interfaces over the APIs.",
      cards: {
        experienceIntake: {
          title: "Experience Intake",
          description: "Parse raw experience text or form data into structured experience records.",
        },
        narrativeBuilder: {
          title: "Narrative Builder",
          description: "Analyze the job target and run the staged narrative pipeline to produce a NarrativePlan.",
        },
        resumeGenerator: {
          title: "Resume Generator",
          description: "Build a resume variant with traceability and guardrail checks.",
        },
        interviewPrep: {
          title: "Interview Prep",
          description: "Generate likely follow-up questions and grounded answer drafts.",
        },
      },
    },
    pages: {
      experienceIntake: {
        eyebrow: "Experience",
        title: "Experience Intake",
        description:
          "Convert raw background text into structured experience data. This page is a thin client over the Experience Structuring API.",
        inputTitle: "Input",
        outputTitle: "Structured Output",
        initialStatus:
          "Paste raw experience text or provide structured content and parse it into Experience records.",
        parsingStatus: "Parsing experience input into structured records...",
        parsedStatus: "Parsed {count} experience record(s).",
        errorStatus: "Failed to parse experience.",
        rawTextLabel: "Raw Experience Text",
        rawTextHint:
          "Paste one or more experience blocks. The parser preserves source text for traceability.",
        rawTextPlaceholder:
          "Example: Senior Engineer at Acme\nJan 2022 - Present\nLed integration work...",
        parseButton: "Parse Experience",
        parsingButton: "Parsing...",
        noResult: "No parsed experience yet.",
        confidenceLabel: "Confidence",
        sections: {
          responsibilities: "Responsibilities",
          outcomes: "Outcomes",
          skills: "Skills",
          evidence: "Evidence",
        },
      },
      narrativeBuilder: {
        eyebrow: "Narrative",
        title: "Narrative Builder",
        description:
          "Run JD analysis and the multi-stage narrative pipeline. This page intentionally exposes the intermediate structure instead of hiding it.",
        inputTitle: "Input",
        outputTitle: "Output",
        initialStatus:
          "Analyze a JD first, then run the staged narrative pipeline with your Experience array.",
        runningStatus: "Analyzing target role and building staged narrative outputs...",
        successStatus: "Narrative pipeline completed.",
        errorStatus: "Failed to build narrative.",
        jobDescriptionLabel: "Job Description",
        jobDescriptionPlaceholder: "Paste the target JD here...",
        companyNotesLabel: "Company Notes",
        companyNotesPlaceholder: "Optional context about company preference or role expectations...",
        experienceJsonLabel: "Experience JSON",
        experienceJsonHint: "Paste the Experience[] response from Experience Intake.",
        experienceJsonPlaceholder: "[]",
        buildButton: "Build Narrative",
        buildingButton: "Running...",
        noResult: "No narrative output yet.",
        sections: {
          jobTarget: "Job Target",
          narrativeStrategy: "Narrative Strategy",
          experienceMatchHints: "Experience Match Hints",
          pipelineResult: "Pipeline Result",
        },
      },
      resumeGenerator: {
        eyebrow: "Resume",
        title: "Resume Generator",
        description:
          "Generate a role-specific resume variant from structured inputs. Blocking guardrail failures surface as API errors instead of silent warnings.",
        inputTitle: "Input",
        outputTitle: "Output",
        initialStatus: "Generate a resume variant from persisted narrative data.",
        runningStatus: "Generating resume variant with traceability and guardrails...",
        successStatus: "Resume variant generated.",
        errorStatus: "Failed to generate resume variant.",
        experienceJsonLabel: "Experience JSON",
        jobTargetJsonLabel: "JobTarget JSON",
        narrativePlanJsonLabel: "NarrativePlan JSON",
        placeholderArray: "[]",
        placeholderObject: "{}",
        generateButton: "Generate Resume Variant",
        generatingButton: "Generating...",
        noResult: "No resume variant yet.",
        sections: {
          resumeVariant: "Resume Variant",
          traceabilityMap: "Traceability Map",
          consistencyChecks: "Consistency Checks",
        },
      },
      interviewPrep: {
        eyebrow: "Interview",
        title: "Interview Prep",
        description:
          "Generate likely follow-up questions and grounded answer drafts from your resume variant and narrative plan.",
        inputTitle: "Input",
        outputTitle: "Output",
        initialStatus:
          "Generate follow-up questions from risk points, transition logic, and evidence gaps.",
        runningStatus: "Generating interview prep...",
        successStatus: "Interview prep generated.",
        errorStatus: "Failed to generate interview prep.",
        experienceJsonLabel: "Experience JSON",
        resumeVariantJsonLabel: "ResumeVariant JSON",
        narrativePlanJsonLabel: "NarrativePlan JSON",
        placeholderArray: "[]",
        placeholderObject: "{}",
        generateButton: "Generate Interview Prep",
        generatingButton: "Generating...",
        noResult: "No interview prep yet.",
        sections: {
          questionSet: "Question Set",
          answerDrafts: "Answer Drafts",
        },
      },
    },
  },
  zh: {
    metadata: {
      title: "CV-One",
      description: "AI 求职叙事工具",
    },
    common: {
      brand: "CV-One",
      language: "语言",
      localeNames: {
        en: "English",
        zh: "中文",
      },
      actions: {
        openPage: "打开页面",
      },
      emptyState: {
        noOrganization: "未填写组织",
        notAvailable: "暂无",
      },
      experienceTypes: {
        ROLE: "角色经历",
        PROJECT: "项目经历",
        INITIATIVE: "专项经历",
      },
    },
    nav: {
      experienceIntake: "经历录入",
      narrativeBuilder: "叙事构建",
      resumeGenerator: "简历生成",
      interviewPrep: "面试准备",
    },
    home: {
      eyebrow: "叙事引擎",
      title: "构建一套可被追问的求职故事。",
      description:
        "CV-One 会把原始经历整理成结构化证据、连贯的转型叙事、定制化简历，以及可落地的面试准备。界面刻意保持简洁，让重心始终放在可追溯性和叙事一致性上。",
      pills: ["黑白界面系统", "叙事优先", "可面试解释"],
      primaryAction: "从经历录入开始",
      secondaryAction: "打开叙事构建",
      workflowEyebrow: "工作流",
      workflowTitle: "四个 MVP 工作台",
      workflowDescription:
        "每个页面都直接对应一个已实现的后端模块。当前没有额外的复杂编排层，只有围绕 API 的轻量界面。",
      cards: {
        experienceIntake: {
          title: "经历录入",
          description: "把原始经历文本或表单数据解析成结构化 Experience 记录。",
        },
        narrativeBuilder: {
          title: "叙事构建",
          description: "分析目标岗位，并运行分阶段 narrative pipeline，生成 NarrativePlan。",
        },
        resumeGenerator: {
          title: "简历生成",
          description: "生成带有溯源映射和一致性校验的简历版本。",
        },
        interviewPrep: {
          title: "面试准备",
          description: "生成高概率追问和有真实经历支撑的回答草稿。",
        },
      },
    },
    pages: {
      experienceIntake: {
        eyebrow: "经历",
        title: "经历录入",
        description:
          "把原始背景文本转换成结构化经历数据。这个页面是 Experience Structuring API 的轻量前端。",
        inputTitle: "输入",
        outputTitle: "结构化输出",
        initialStatus: "粘贴原始经历文本，或提供结构化内容并解析成 Experience 记录。",
        parsingStatus: "正在将经历输入解析为结构化记录...",
        parsedStatus: "已解析 {count} 条经历记录。",
        errorStatus: "经历解析失败。",
        rawTextLabel: "原始经历文本",
        rawTextHint: "可粘贴一段或多段经历文本。系统会保留原始文本用于溯源。",
        rawTextPlaceholder: "示例：Acme 高级工程师\n2022年1月 - 至今\n主导集成工作...",
        parseButton: "解析经历",
        parsingButton: "解析中...",
        noResult: "暂未生成结构化经历。",
        confidenceLabel: "置信度",
        sections: {
          responsibilities: "职责",
          outcomes: "结果",
          skills: "技能",
          evidence: "证据",
        },
      },
      narrativeBuilder: {
        eyebrow: "叙事",
        title: "叙事构建",
        description:
          "先运行 JD 分析，再执行多阶段 narrative pipeline。这个页面会有意展示中间结构，而不是把它们隐藏起来。",
        inputTitle: "输入",
        outputTitle: "输出",
        initialStatus: "先分析 JD，再结合 Experience 数组运行分阶段叙事流程。",
        runningStatus: "正在分析目标岗位并构建分阶段叙事输出...",
        successStatus: "叙事 pipeline 已完成。",
        errorStatus: "叙事构建失败。",
        jobDescriptionLabel: "职位描述",
        jobDescriptionPlaceholder: "请粘贴目标 JD...",
        companyNotesLabel: "公司备注",
        companyNotesPlaceholder: "可选，填写公司偏好或岗位预期等背景信息...",
        experienceJsonLabel: "Experience JSON",
        experienceJsonHint: "粘贴 Experience Intake 返回的 Experience[]。",
        experienceJsonPlaceholder: "[]",
        buildButton: "构建叙事",
        buildingButton: "运行中...",
        noResult: "暂未生成叙事结果。",
        sections: {
          jobTarget: "Job Target",
          narrativeStrategy: "叙事策略",
          experienceMatchHints: "经历匹配提示",
          pipelineResult: "Pipeline 结果",
        },
      },
      resumeGenerator: {
        eyebrow: "简历",
        title: "简历生成",
        description:
          "基于结构化输入生成岗位定制化简历。若 guardrails 命中阻断项，会直接显示 API 错误，而不是静默忽略。",
        inputTitle: "输入",
        outputTitle: "输出",
        initialStatus: "基于已落库的 narrative 数据生成简历版本。",
        runningStatus: "正在生成带溯源和 guardrails 的简历版本...",
        successStatus: "简历版本已生成。",
        errorStatus: "简历版本生成失败。",
        experienceJsonLabel: "Experience JSON",
        jobTargetJsonLabel: "JobTarget JSON",
        narrativePlanJsonLabel: "NarrativePlan JSON",
        placeholderArray: "[]",
        placeholderObject: "{}",
        generateButton: "生成简历版本",
        generatingButton: "生成中...",
        noResult: "暂未生成简历版本。",
        sections: {
          resumeVariant: "简历版本",
          traceabilityMap: "溯源映射",
          consistencyChecks: "一致性检查",
        },
      },
      interviewPrep: {
        eyebrow: "面试",
        title: "面试准备",
        description:
          "根据简历版本与 NarrativePlan 生成高概率追问，以及有真实经历支撑的回答草稿。",
        inputTitle: "输入",
        outputTitle: "输出",
        initialStatus: "根据风险点、转型逻辑和证据缺口生成追问。",
        runningStatus: "正在生成面试准备内容...",
        successStatus: "面试准备内容已生成。",
        errorStatus: "面试准备生成失败。",
        experienceJsonLabel: "Experience JSON",
        resumeVariantJsonLabel: "ResumeVariant JSON",
        narrativePlanJsonLabel: "NarrativePlan JSON",
        placeholderArray: "[]",
        placeholderObject: "{}",
        generateButton: "生成面试准备",
        generatingButton: "生成中...",
        noResult: "暂未生成面试准备内容。",
        sections: {
          questionSet: "问题集合",
          answerDrafts: "回答草稿",
        },
      },
    },
  },
};

export type AppMessages = MessageSchema;

export function getMessages(locale: Locale): AppMessages {
  return messages[locale];
}
