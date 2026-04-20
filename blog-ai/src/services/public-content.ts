import { siteIdentity } from "@/config/site";
import type {
  PublicConceptGraphContent,
  PublicContentBundle,
  PublicInsightItem,
  PublicJourneyItem,
  PublicJourneyStage,
  PublicProjectItem,
  PublicSiteProfile,
  PublicTaxonomyData,
} from "@/types/public-content";

const API_BASE =
  import.meta.env.VITE_PUBLIC_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3011/api" : "/api-ai");

export const fallbackSiteProfile: PublicSiteProfile = {
  siteName: siteIdentity.name,
  tagline: siteIdentity.subtitle,
  heroTitle: "AI 内容站点",
  heroIntro: "当前站点会展示后台已发布的学习、资讯和项目内容。",
  contactEmail: "hello@ai-explore.local",
  updatedAt: "",
};

export const fallbackJourneyItems: PublicJourneyItem[] = [];
export const fallbackJourneyStages: PublicJourneyStage[] = [];
export const fallbackInsightItems: PublicInsightItem[] = [];
export const fallbackProjectItems: PublicProjectItem[] = [];
export const fallbackTaxonomy: PublicTaxonomyData = {
  insightCategories: [],
  projectTags: [],
  updatedAt: "",
};
export const fallbackConceptGraph: PublicConceptGraphContent = {
  nodes: [
    {
      name: "LLM",
      category: "core",
      desc: "大语言模型负责理解、推理和生成，是整个 AI 体验的基础能力中心。",
      example: "GPT / Claude / Gemini",
    },
    {
      name: "Agent",
      category: "agent",
      desc: "智能体把模型、任务拆解、工具调用和状态管理串联起来。",
      example: "任务规划与自动执行",
    },
    {
      name: "RAG",
      category: "tool",
      desc: "检索增强生成让回答不只依赖参数知识，也能利用外部资料。",
      example: "向量检索 + 重排序",
    },
    {
      name: "MCP",
      category: "tool",
      desc: "模型上下文协议负责把工具、资源和能力标准化接入到模型侧。",
      example: "统一工具调用协议",
    },
    {
      name: "Workflow",
      category: "skill",
      desc: "工作流把复杂任务拆成多步节点，让执行过程更可控、更稳定。",
      example: "编排式任务流",
    },
    {
      name: "Memory",
      category: "skill",
      desc: "记忆层负责保存上下文、用户偏好和阶段性结果，提升连续交互体验。",
      example: "短期记忆 / 长期记忆",
    },
    {
      name: "Search",
      category: "skill",
      desc: "搜索能力帮助系统获取实时信息，补足模型离线知识边界。",
      example: "联网检索",
    },
    {
      name: "Tool Calling",
      category: "agent",
      desc: "工具调用把模型输出转成可执行动作，连接外部系统与数据。",
      example: "函数调用 / API 执行",
    },
  ],
  edges: [
    {
      source: "LLM",
      target: "Agent",
      relation: "驱动核心",
      description: "Agent 以 LLM 作为理解与决策的中枢。",
    },
    {
      source: "Agent",
      target: "Workflow",
      relation: "执行编排",
      description: "复杂任务通常通过 Workflow 被组织为多步骤流程。",
    },
    {
      source: "Agent",
      target: "Tool Calling",
      relation: "动作出口",
      description: "Agent 通过 Tool Calling 与外部能力发生交互。",
    },
    {
      source: "Tool Calling",
      target: "MCP",
      relation: "协议承载",
      description: "MCP 为工具和资源接入提供统一标准。",
    },
    {
      source: "Agent",
      target: "Memory",
      relation: "状态维持",
      description: "记忆帮助 Agent 保持连续任务中的上下文一致性。",
    },
    {
      source: "RAG",
      target: "Search",
      relation: "检索协作",
      description: "Search 为 RAG 提供实时来源与候选信息。",
    },
    {
      source: "Agent",
      target: "RAG",
      relation: "知识增强",
      description: "Agent 接入 RAG 来补足动态知识和垂直领域内容。",
    },
    {
      source: "LLM",
      target: "Memory",
      relation: "上下文利用",
      description: "模型结合记忆内容生成更连贯、更贴合用户的问题回答。",
    },
  ],
  updatedAt: "",
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPublicContentBundle(): Promise<PublicContentBundle> {
  const [siteProfile, journeyItems, insightItems, projectItems, taxonomy] =
    await Promise.all([
      request<PublicSiteProfile>("/public/site-profile"),
      request<PublicJourneyItem[]>("/public/journey"),
      request<PublicInsightItem[]>("/public/insights"),
      request<PublicProjectItem[]>("/public/projects"),
      request<PublicTaxonomyData>("/public/taxonomy"),
    ]);

  let journeyStages: PublicJourneyStage[] = [];

  try {
    const stageData = await request<{ stages: PublicJourneyStage[] }>(
      "/public/journey-stages",
    );
    journeyStages = stageData.stages || [];
  } catch {
    journeyStages = [];
  }

  let conceptGraph = fallbackConceptGraph;

  try {
    conceptGraph = await request<PublicConceptGraphContent>("/public/concept-graph");
  } catch {
    conceptGraph = fallbackConceptGraph;
  }

  return {
    siteProfile,
    journeyItems,
    journeyStages,
    insightItems,
    projectItems,
    taxonomy,
    conceptGraph,
  };
}
