# CV-One MVP 产品需求文档（中文版重构版）

## 1. 产品概述

**CV-One** 是一款面向求职场景的 AI 叙事工具，核心目标不是“润色简历”，而是帮助用户把零散、割裂、难以解释的过往经历，重构为一套**逻辑一致、可被追问、可在面试中自洽解释**的职业叙事。

MVP 聚焦四个核心任务：

1. 将用户过往经历结构化为标准化职业资料
2. 基于真实经历构建连贯的职业 Narrative
3. 针对特定 JD 与公司偏好生成定制化简历版本
4. 基于该叙事与简历，生成可能的面试追问及回答草稿

CV-One 的核心差异点是：**叙事一致性（Narrative Consistency）优先于文案生成效率**。  
它尤其适用于从技术角色转向产品角色的用户，因为这类用户的核心问题通常不是“没有经历”，而是：

- 过往经历与目标岗位之间缺少清晰解释路径
- 简历表述与真实经历之间容易出现“面试不可自证”的风险
- 不知道哪些经历应该强调，哪些表述应该弱化
- 无法稳定回答“为什么转产品”“你是否真正做过产品工作”“你的经历如何支持这个岗位”的追问

### 产品原则

- 所有输出必须基于用户真实输入
- 不允许虚构经历、职责、成果或影响范围
- 所有生成内容必须可面试解释
- Narrative consistency 是系统第一优先级
- 系统应遵循“**先结构化事实，再生成叙事，再生成输出，再做一致性校验**”的处理顺序

---

## 2. 目标用户

### 核心用户

从**技术岗位转向产品岗位**的求职者，包括但不限于：

- 软件工程师转产品经理
- 数据/分析岗位转产品岗位
- 技术背景创业者或 builder 转产品岗位
- 做过跨职能工作但无法清晰定位自己的候选人

### 次级用户

具有以下特征的早中期求职者：

- 职业路径非线性
- 多段经历职责重叠，难以抽象主线
- 简历更像经历罗列，而非职业故事
- 面对不同 JD 时难以快速形成可信的“匹配逻辑”

### 用户共性

- 有真实经历，但缺乏职业叙事能力
- 需要的不只是“改写”，而是“论证”
- 希望输出能直接支撑面试，不仅是投递

---

## 3. 核心痛点

### 3.1 经历真实，但叙事不成立

很多用户的实际经历并不差，但无法形成一个清晰回答以下问题的职业故事：

- 我是谁
- 我为什么适合这个岗位
- 我为什么从过去走到这里
- 我的转型是否有逻辑可循

### 3.2 简历内容与目标岗位之间缺少映射

传统简历常见问题：

- 只描述任务，不描述判断、协同、影响和结果
- 技术经历无法被重构为产品相关能力
- 与目标 JD 的对应关系不清晰
- 同一份简历面对不同岗位缺少重点切换能力

### 3.3 转型用户最怕“面试一追问就散”

尤其是技术转产品用户，常见面试风险包括：

- 为什么转产品，不继续做技术
- 你说自己有产品思维，具体体现在哪
- 你到底做过“产品决策”还是只是“技术执行”
- 你写在简历里的内容，是否能给出完整场景、动作、结果和反思

### 3.4 通用 AI 工具偏关键词，不偏一致性

多数 AI 简历工具能做：

- 关键词提取
- 文案润色
- JD 匹配改写

但做不好：

- 跨经历抽象主线
- 构造可追问的转型逻辑
- 约束表述不过度
- 保证简历、叙事、面试回答三者一致

---

## 4. MVP 范围

### 4.1 MVP 范围内

#### 1. Experience Intake and Structuring（经历录入与结构化）
系统支持用户输入过往工作、项目、职责、成果、技能与上下文信息，并将其转化为结构化的经历数据。

范围包括：

- 手动输入或粘贴原始经历文本
- 结构化为 Experience 数据
- 保留原始文本与证据备注，供后续溯源

#### 2. Career Narrative Planning（职业叙事规划）
系统基于用户经历与目标岗位，构建一份可解释、可防御的叙事方案。

范围包括：

- 提取经历中的产品相关信号
- 汇总为叙事主题
- 建立转型逻辑
- 生成 Narrative Plan

#### 3. Resume Tailoring（简历定制）
系统基于结构化经历与叙事方案，生成针对单个 JD 的简历版本。

范围包括：

- 为目标 JD 选择相关经历
- 对经历进行目标导向表达
- 输出可追溯的简历内容
- 避免超出事实边界的表达

#### 4. Interview Follow-up Preparation（面试追问准备）
系统基于简历版本与叙事方案，生成可能面试追问及回答草稿。

范围包括：

- 生成追问问题
- 输出基于真实经历的回答框架
- 标记高风险追问点与证据不足点

### 4.2 明确不做的内容

- 多岗位并行管理
- 自动投递
- 职位聚合/职位抓取
- 求职流程管理
- Cover Letter 生成
- Portfolio/个人站生成
- 职场辅导、模拟面试系统
- 深度公司研究
- 多语言支持
- 虚构、补齐或美化用户没有提供的经历

### 4.3 MVP 边界约束

- 单用户流程
- 一次只面向一个目标岗位
- 输出以文本与结构化结果为主
- 默认用户会人工审阅与修改
- 不以视觉呈现为重点，先保证 narrative consistency 和工程可落地

---

## 5. 关键用户流程

### 流程一：建立职业基础档案

1. 用户输入工作经历、项目经历、成果、技能、补充说明
2. 系统将原始输入结构化为 Experience
3. 系统做基础规则校验：
   - 时间是否缺失或冲突
   - 角色/项目是否字段不完整
   - 成果是否没有对应行为描述
4. 系统输出结构化经历档案，作为后续所有生成的唯一事实基础

### 流程二：围绕目标岗位构建叙事

1. 用户输入目标 JD 和可选的公司偏好信息
2. 系统分析岗位要求、能力信号和隐含期待
3. 系统将 Experience 与 Job Target 做匹配
4. Narrative Engine 按多阶段 pipeline 生成 Narrative Plan
5. 系统输出：
   - 定位陈述
   - 转型逻辑
   - 应强调点
   - 应弱化点
   - 风险点与不可过度表述点

### 流程三：生成简历版本

1. 系统读取 Experience、Job Target、Narrative Plan
2. 根据叙事策略选择经历与表述重点
3. 生成 Resume Variant
4. 进行一致性校验：
   - 每条 bullet 是否可溯源
   - 是否出现未经支持的产品 ownership 表述
   - 是否出现时间线和职责夸大问题
5. 输出可用于人工修改的简历版本

### 流程四：生成面试追问与回答草稿

1. 系统读取 Resume Variant 与 Narrative Plan
2. 生成高概率追问问题
3. 基于真实经历生成回答草稿
4. 进行一致性校验：
   - 回答是否与简历一致
   - 回答是否引用了真实经历
   - 是否存在难以自证的说法
5. 输出 Interview Kit

---

## 6. 功能模块

### 6.1 Experience Structuring Module

**目标**  
将用户输入的原始经历转为可计算、可追溯、可复用的结构化职业数据。

**输入**
- 原始工作经历文本
- 原始项目描述
- 用户填写的职责、成果、技能、补充说明

**输出**
- `Experience[]`
- 原始文本到结构化字段的映射
- 基础校验结果

**处理方式**
- 确定性逻辑（代码）
  - 字段标准化
  - 日期解析
  - 空值检查
  - 基础去重
  - 结构完整性校验
- LLM 推理
  - 从长文本中辅助抽取职责、成果、技能候选项
  - 将自然语言拆成结构化字段草稿
- 人工确认
  - 用户确认或修改抽取结果

**工程要求**
- 原始输入必须保留，不可只保留生成结果
- 每条结构化 Experience 必须能回链到 source text
- Experience 是后续所有模块的唯一事实上游

---

### 6.2 Job Target Analyzer

**目标**  
不仅理解 JD“写了什么”，更要输出“叙事该如何调整”。

**输入**
- `jobDescriptionRaw`
- 可选 `companyNotes`
- 已结构化的 `Experience[]`

**输出**
- `JobTarget`
- `NarrativeAdjustmentStrategy`
- `ExperienceMatchHints`

**输出内容要求**

#### A. JobTarget 基础结构
- 岗位标题
- 核心职责
- 核心要求
- 加分项
- 关键词
- 偏好信号

#### B. Narrative Adjustment Strategy
用于指导后续 Narrative Builder 与 Resume Generator，必须包含：

- `emphasizePoints[]`
  - 应重点强调的能力、经历类型、成果表达
- `downplayPoints[]`
  - 应弱化的内容，例如过重技术实现细节
- `transitionAngles[]`
  - 适合本 JD 的转型切入角度
- `roleFitHypotheses[]`
  - 用户哪些过往经历最可能支持“适合这个岗位”的论证

#### C. Experience Match Hints
不是最终判断，而是匹配提示：

- 哪些 Experience 与 JD 强相关
- 哪些 Experience 可作为补充论据
- 哪些 Experience 不建议放入主叙事

**处理方式**
- 确定性逻辑（代码）
  - JD 分段
  - 责任/要求规则提取
  - 关键词归类
  - Experience 与 JD 的基础向量/规则匹配
- LLM 推理
  - 推断岗位隐含期待
  - 识别更适合的叙事强调策略
  - 给出“强调/弱化/转型角度”建议

**说明**
该模块不能只停留在关键词提取层。它必须为 Narrative Builder 提供明确的“叙事调整策略”。

---

### 6.3 Narrative Engine

**目标**  
构建一套可解释、可防御、可被后续输出复用的职业叙事方案。

**核心原则**  
**禁止一步生成完整 narrative。必须拆为多阶段 pipeline。**

### Narrative Pipeline 设计

#### 阶段 1：Experience → Signals

**目标**  
从每条经历中抽取与目标岗位相关的能力信号，而不是直接写故事。

**输入**
- `Experience[]`
- `JobTarget`
- `NarrativeAdjustmentStrategy`

**输出**
- `ExperienceSignal[]`

**典型 signal 示例**
- 用户有跨团队协作信号
- 用户有需求理解/问题定义信号
- 用户有优先级判断信号
- 用户有指标结果导向信号
- 用户有从技术执行向产品决策靠近的信号

**处理方式**
- 确定性逻辑
  - 从字段中做基础标签归类
  - 基于关键词和规则识别显式 signal
- LLM 推理
  - 识别隐式 signal
  - 判断某段经历是否体现产品相关能力

#### 阶段 2：Signals → Themes

**目标**  
将离散 signal 聚合为较稳定的职业主题。

**输入**
- `ExperienceSignal[]`

**输出**
- `NarrativeTheme[]`

**主题示例**
- 长期偏用户问题导向
- 擅长在不确定环境中协调交付
- 具备从实现层上升到需求层的倾向
- 有用技术背景支撑产品判断的优势

**处理方式**
- 确定性逻辑
  - 聚合同类 signal
  - 统计出现频次与覆盖经历范围
- LLM 推理
  - 归纳主题命名
  - 判断哪些主题构成主线，哪些只适合做辅助

#### 阶段 3：Themes → Transition Logic

**目标**  
将主题组织成“为什么你现在适合这个岗位”的过渡逻辑。

**输入**
- `NarrativeTheme[]`
- `JobTarget`
- `ExperienceMatchHints`

**输出**
- `TransitionLogic`

**应回答的问题**
- 为什么从技术走向产品是合理的
- 哪些过往经历体现了转型并非跳跃，而是连续演化
- 为什么这个目标岗位与用户背景存在合理匹配

**处理方式**
- 确定性逻辑
  - 检查逻辑链是否缺少支撑经历
  - 标记断裂点
- LLM 推理
  - 组织自然语言逻辑
  - 形成更接近“面试可讲述”的过渡解释

#### 阶段 4：Transition Logic → Narrative Plan

**目标**  
产出最终供下游使用的叙事方案，而不是最终文案。

**输入**
- `TransitionLogic`
- `NarrativeAdjustmentStrategy`
- `ConsistencyCheck[]`

**输出**
- `NarrativePlan`

**NarrativePlan 应包含**
- `positioningStatement`
- `careerStorySummary`
- `coreThemes[]`
- `transitionLogic`
- `strengthsToEmphasize[]`
- `downplayPoints[]`
- `risksToAddress[]`
- `claimsToAvoid[]`
- `evidenceGaps[]`

**说明**
Narrative Plan 是简历生成和面试回答生成的共同上游，不应被跳过。

---

### 6.4 Resume Variant Generator

**目标**  
在不突破真实经历边界的前提下，生成适配特定 JD 的简历版本。

**输入**
- `Experience[]`
- `JobTarget`
- `NarrativePlan`

**输出**
- `ResumeVariant`
- `TraceabilityMap`
- `ConsistencyCheck[]`

**处理方式**
- 确定性逻辑
  - 选择候选经历
  - 生成 bullet 与 Experience 的引用映射
  - 检查是否引用了未入选经历
- LLM 推理
  - 在 Narrative Plan 约束下重写 bullet
  - 调整表达顺序和重点
- 规则约束
  - 不允许添加 Experience 中不存在的职责与结果
  - 不允许把“参与支持”写成“独立 owner”
  - 不允许把技术实现直接升级为产品主导，除非有证据

---

### 6.5 Interview Prep Generator

**目标**  
围绕简历版本和叙事方案，生成面试中最可能出现的追问与回答草稿。

**输入**
- `ResumeVariant`
- `NarrativePlan`
- `Experience[]`

**输出**
- `InterviewQuestionSet`
- `InterviewAnswerDraft[]`
- `ConsistencyCheck[]`

**处理方式**
- 确定性逻辑
  - 从高风险 bullet、转型点、弱证据点生成候选追问
  - 将回答与 supporting experiences 建立映射
- LLM 推理
  - 组织自然语言回答框架
  - 生成更接近真实面试表达的答案草稿
- 规则约束
  - 回答必须绑定 supporting experiences
  - 回答不得引入新事实
  - 回答不得比简历声明更强

---

### 6.6 Consistency Guardrails

**目标**  
确保所有输出在事实、逻辑、表达强度上都可被解释和追问，不仅“看起来合理”。

**核心原则**
- 不允许仅依赖 LLM 判断
- Guardrails 必须由三层组成：
  - `traceability` 溯源映射
  - `rule-based` 规则校验
  - `LLM-assisted` 模型辅助判断

#### A. Traceability（溯源映射）
用于回答：“这句话到底来自哪条真实经历？”

必须覆盖：

- Resume bullet → Experience
- Interview answer claim → Experience
- Narrative theme / transition claim → supporting signals / experiences

若无法回链，则视为高风险输出。

#### B. Rule-based 校验（主判断）
应优先使用代码完成的检查包括：

- 时间线冲突
- 缺失 supporting experience
- 重复或矛盾的角色时间段
- 简历 bullet 无来源
- 回答草稿中出现 source 中不存在的动作/成果
- 表述强度超出原始经历字段
- Narrative 中存在无法被任何 signal 支撑的主题

#### C. LLM-assisted 校验（辅助判断）
适合模型参与但不应单独裁决的检查包括：

- 某个表述是否存在轻微 scope inflation 风险
- 某个 transition 逻辑是否“读起来合理但支撑不足”
- 某个 theme 是否过度概括
- 某个回答是否偏空泛、偏抽象、偏不可落地

**最终原则**
- 规则命中可直接拦截
- 模型判断只用于补充风险提示、排序或提出人工审阅建议
- LLM 不能单独决定“事实成立”

---

## 7. 非目标（Non-Goals）

本 MVP 明确不做以下内容：

- 职位聚合、职位搜索、职位推荐
- 自动投递和申请跟踪
- Cover Letter 生成
- 社交网络/冷启动 outreach 文案
- Portfolio、个人主页、作品集生成
- 模拟面试系统
- 多语言版本
- 团队协作、招聘方视角工作台
- 深度公司研究或市场情报
- 图形化简历排版优化
- 用户未提供经历的虚构、补齐、合理化包装
- 对无法证明的经历进行“故事化增强”

这些内容不纳入 MVP，是为了确保资源集中在**叙事一致性、可解释性、工程可控性**上。

---

## 8. 成功指标

### 8.1 核心指标

- 生成的简历 bullet 中，可回溯到真实 Experience 的比例
- Narrative Plan 中可被 signal 或 experience 支撑的 claim 比例
- 用户对“这份叙事我能在面试中解释清楚”的主观评分
- 用户对“简历与目标 JD 匹配度”的主观评分

### 8.2 工程质量指标

- 被规则校验拦截的 unsupported claim 数量
- 需人工修改的高风险 narrative/简历/回答项占比
- Interview Answer 中 supporting experience 缺失率
- 同一用户在多个目标 JD 下重复使用结构化档案的比例

### 8.3 体验效率指标

- 从原始经历输入到首版 Narrative Plan 的耗时
- 从输入 JD 到产出 Resume Variant 的耗时
- 用户完成一次“经历录入 → 叙事生成 → 简历输出”的完成率

### 8.4 定性成功信号

对技术转产品用户而言，理想反馈应是：

“我终于能清楚讲明白，为什么我适合这个岗位，而且被追问时也不虚。”

---

## 9. 核心数据模型

以下数据模型只覆盖 MVP 所需最小集合，不增加非 MVP 模块。

### 9.1 Experience

表示一条工作、项目或关键经历单元。

**关键字段**
- `id`
- `type`：`role | project | initiative`
- `title`
- `organization`
- `startDate`
- `endDate`
- `summary`
- `responsibilities[]`
- `outcomes[]`
- `skills[]`
- `tools[]`
- `evidenceNotes[]`
- `sourceText`
- `confidenceLevel`

**说明**
- `sourceText` 必须保留，供后续 traceability 使用
- `confidenceLevel` 表示结构化完整度，不表示事实真伪

---

### 9.2 JobTarget

表示目标岗位定义。

**关键字段**
- `id`
- `jobTitle`
- `company`
- `jobDescriptionRaw`
- `responsibilities[]`
- `requirements[]`
- `preferenceSignals[]`
- `roleKeywords[]`

---

### 9.3 NarrativeAdjustmentStrategy

表示 JD 分析后对叙事的调整策略。

**关键字段**
- `id`
- `jobTargetId`
- `emphasizePoints[]`
- `downplayPoints[]`
- `transitionAngles[]`
- `roleFitHypotheses[]`

**说明**
该对象由 Job Target Analyzer 输出，是 Narrative Builder 的关键输入。

---

### 9.4 ExperienceSignal

表示从具体经历中抽取出的岗位相关信号。

**关键字段**
- `id`
- `experienceId`
- `signalType`
- `signalText`
- `evidenceRefs[]`
- `confidence`

**说明**
是 Narrative Engine pipeline 第一阶段结果。

---

### 9.5 NarrativeTheme

表示由多个 signals 聚合出的职业主题。

**关键字段**
- `id`
- `themeName`
- `description`
- `supportingSignalIds[]`
- `supportingExperienceIds[]`

---

### 9.6 TransitionLogic

表示从主题到目标岗位之间的逻辑连接。

**关键字段**
- `id`
- `jobTargetId`
- `logicSummary`
- `supportingThemeIds[]`
- `riskPoints[]`
- `missingLinks[]`

---

### 9.7 NarrativePlan

表示最终供下游使用的叙事方案。

**关键字段**
- `id`
- `jobTargetId`
- `positioningStatement`
- `careerStorySummary`
- `transitionLogic`
- `coreThemes[]`
- `strengthsToEmphasize[]`
- `downplayPoints[]`
- `risksToAddress[]`
- `claimsToAvoid[]`
- `evidenceGaps[]`
- `supportingExperienceIds[]`

---

### 9.8 ResumeVariant

表示针对单一 JD 生成的一版简历输出。

**关键字段**
- `id`
- `jobTargetId`
- `narrativePlanId`
- `selectedExperienceIds[]`
- `summary`
- `experienceBullets[]`
- `skillsSection[]`
- `tailoringNotes[]`
- `traceabilityMap`

**说明**
`traceabilityMap` 必须存在，用于建立 bullet 与 Experience 的映射。

---

### 9.9 InterviewQuestionSet

表示围绕某份简历版本生成的潜在追问集合。

**关键字段**
- `id`
- `resumeVariantId`
- `questions[]`

---

### 9.10 InterviewAnswerDraft

表示基于真实经历生成的面试回答草稿。

**关键字段**
- `id`
- `question`
- `answerOutline`
- `supportingExperienceIds[]`
- `riskFlags[]`
- `userReviewStatus`

---

### 9.11 ConsistencyCheck

表示系统的一致性校验结果。

**关键字段**
- `id`
- `entityType`
- `entityId`
- `issueType`
  - `unsupported_claim`
  - `timeline_conflict`
  - `scope_inflation`
  - `unclear_transition`
- `severity`
- `message`
- `relatedExperienceIds[]`
- `checkSource`
  - `traceability`
  - `rule_engine`
  - `llm_assist`

---

## 10. 系统架构方案（高层）

系统架构必须服务于一个核心目标：  
**让所有下游输出都建立在结构化事实和分阶段叙事推理之上，而不是一次性生成。**

### 10.1 总体分层

#### 1. Input Layer
负责接收原始输入：

- 用户手动输入的职业经历
- 用户粘贴的项目描述或说明文本
- 目标 JD
- 可选公司偏好说明

**特点**
- 输入可以不规范
- 但进入下一层前必须结构化

---

#### 2. Structured Profile Layer
负责保存规范化后的基础数据：

- `Experience`
- `JobTarget`
- `NarrativeAdjustmentStrategy`

**职责**
- 成为所有生成模块的事实来源
- 不允许下游直接绕过结构层使用原始长文本作为主输入

---

#### 3. Narrative Reasoning Layer
这是 MVP 的核心层，必须采用 pipeline 形式，而不是单次 prompt 生成。

### 推荐数据流

`Experience + JobTarget + Strategy`
→ `ExperienceSignal`
→ `NarrativeTheme`
→ `TransitionLogic`
→ `NarrativePlan`

**分工说明**

- 确定性逻辑（代码）负责：
  - 字段清洗
  - 映射
  - 聚合
  - 规则检查
  - 支撑关系建立
- LLM 推理负责：
  - signal 补充识别
  - theme 抽象
  - transition 语言组织
  - plan 文本化表达

---

#### 4. Output Generation Layer
基于 `NarrativePlan` 生成具体输出：

- `ResumeVariant`
- `InterviewQuestionSet`
- `InterviewAnswerDraft`

**约束**
- 必须读取结构化事实上游
- 必须读取 Narrative Plan
- 不允许跳过 Narrative Plan 直接从 Experience 生成最终输出

---

#### 5. Consistency & Safety Layer
贯穿 Narrative 与 Output 两层。

### 校验链路

- 结构化后做基础规则校验
- Narrative pipeline 各阶段做支撑关系检查
- Resume 生成后做 traceability 和规则校验
- Interview Answer 生成后再做一次一致性校验

### 三层能力分工

#### A. Traceability Layer
负责映射关系存储与查询。

主要能力：
- claim 对应到哪些 experience
- bullet 对应到哪些 source text
- answer 对应到哪些 support

#### B. Rule Engine
负责确定性拦截。

主要能力：
- 时间线冲突检查
- claim 无来源检查
- 表述强度越界检查
- 逻辑链断裂检查

#### C. LLM Assist
负责语义风险补充。

主要能力：
- 识别可能夸张但不易规则化的问题
- 识别 narrative 是否空泛
- 识别 transition 是否牵强

---

#### 6. Persistence Layer
负责存储：

- 原始输入
- 结构化实体
- Narrative pipeline 中间结果
- 最终输出
- 一致性校验记录

**说明**
MVP 阶段建议保留 pipeline 中间产物，而不是只保留最终 Narrative Plan。  
原因是：

- 便于调试和纠错
- 便于用户修改某一步后局部重算
- 便于解释“为什么系统得出这个叙事”

---

### 10.2 模块间数据流

### 主流程

1. 用户输入原始经历  
2. Experience Structuring Module 输出 `Experience[]`
3. 用户输入 JD  
4. Job Target Analyzer 输出 `JobTarget + NarrativeAdjustmentStrategy + ExperienceMatchHints`
5. Narrative Engine 分阶段生成：
   - `ExperienceSignal[]`
   - `NarrativeTheme[]`
   - `TransitionLogic`
   - `NarrativePlan`
6. Resume Variant Generator 生成 `ResumeVariant`
7. Interview Prep Generator 生成 `InterviewQuestionSet + InterviewAnswerDraft[]`
8. Consistency Guardrails 在多个节点执行校验并输出 `ConsistencyCheck[]`

### 依赖关系

- `Experience Structuring` 是所有模块的事实上游
- `Job Target Analyzer` 是 Narrative Builder 的策略上游
- `Narrative Engine` 是 Resume 和 Interview 两个模块的共同上游
- `Consistency Guardrails` 贯穿 Narrative 与 Output，不是最后一步才执行的附属模块

---

### 10.3 工程实现原则

- 先结构化，后生成
- 先中间表示，后最终文案
- 规则优先，模型辅助
- 所有最终输出必须可回链到真实经历
- 系统宁可保守，也不输出不可面试解释的内容
- 保持模块简单，避免引入超出 MVP 的复杂抽象

---

## MVP 总结

CV-One MVP 是一个聚焦于**职业叙事构建**的 AI 求职工具。  
它的核心价值不在于“把简历写得更漂亮”，而在于：

- 把真实经历组织成结构化事实
- 用分阶段 pipeline 构建可信职业叙事
- 用规则与溯源机制约束生成边界
- 让简历、叙事和面试回答三者保持一致

对技术转产品用户来说，CV-One 要解决的不是简单的文案问题，而是一个更本质的问题：

**如何把真实经历讲成一条合理、可信、可被追问的职业路径。**
