const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { hasDatabaseConfig, pool } = require('./config/db');

const port = Number(process.env.PORT || 3011);
const dataFile = path.join(__dirname, '..', 'data', 'content.json');
const journeyStagesMetaFile = path.join(__dirname, '..', 'data', 'journey-stages.json');
const conceptGraphMetaFile = path.join(__dirname, '..', 'data', 'concept-graph.json');
const collectionKeys = ['journey', 'insights', 'projects'];
const defaultConceptGraph = {
  nodes: [
    {
      name: 'LLM',
      category: 'core',
      desc: '大语言模型负责理解、推理和生成，是整个 AI 体验的基础能力中心。',
      example: 'GPT / Claude / Gemini',
    },
    {
      name: 'Agent',
      category: 'agent',
      desc: '智能体把模型、任务拆解、工具调用和状态管理串联起来。',
      example: '任务规划与自动执行',
    },
    {
      name: 'RAG',
      category: 'tool',
      desc: '检索增强生成让回答不只依赖参数知识，也能利用外部资料。',
      example: '向量检索 + 重排序',
    },
    {
      name: 'MCP',
      category: 'tool',
      desc: '模型上下文协议负责把工具、资源和能力标准化接入到模型侧。',
      example: '统一工具调用协议',
    },
    {
      name: 'Workflow',
      category: 'skill',
      desc: '工作流把复杂任务拆成多步节点，让执行过程更可控、更稳定。',
      example: '编排式任务流',
    },
    {
      name: 'Memory',
      category: 'skill',
      desc: '记忆层负责保存上下文、用户偏好和阶段性结果，提升连续交互体验。',
      example: '短期记忆 / 长期记忆',
    },
    {
      name: 'Search',
      category: 'skill',
      desc: '搜索能力帮助系统获取实时信息，补足模型离线知识边界。',
      example: '联网检索',
    },
    {
      name: 'Tool Calling',
      category: 'agent',
      desc: '工具调用把模型输出转成可执行动作，连接外部系统与数据。',
      example: '函数调用 / API 执行',
    },
  ],
  edges: [
    {
      source: 'LLM',
      target: 'Agent',
      relation: '驱动核心',
      description: 'Agent 以 LLM 作为理解与决策的中枢。',
    },
    {
      source: 'Agent',
      target: 'Workflow',
      relation: '执行编排',
      description: '复杂任务通常通过 Workflow 被组织为多步骤流程。',
    },
    {
      source: 'Agent',
      target: 'Tool Calling',
      relation: '动作出口',
      description: 'Agent 通过 Tool Calling 与外部能力发生交互。',
    },
    {
      source: 'Tool Calling',
      target: 'MCP',
      relation: '协议承载',
      description: 'MCP 为工具和资源接入提供统一标准。',
    },
    {
      source: 'Agent',
      target: 'Memory',
      relation: '状态维持',
      description: '记忆帮助 Agent 保持连续任务中的上下文一致性。',
    },
    {
      source: 'RAG',
      target: 'Search',
      relation: '检索协作',
      description: 'Search 为 RAG 提供实时来源与候选信息。',
    },
    {
      source: 'Agent',
      target: 'RAG',
      relation: '知识增强',
      description: 'Agent 接入 RAG 来补足动态知识和垂直领域内容。',
    },
    {
      source: 'LLM',
      target: 'Memory',
      relation: '上下文利用',
      description: '模型结合记忆内容生成更连贯、更贴合用户的问题回答。',
    },
  ],
  updatedAt: '',
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function sortJourneyStages(stages) {
  return [...(stages || [])].sort((a, b) => normalizeNumber(a.sortOrder, 0) - normalizeNumber(b.sortOrder, 0));
}

async function ensureJourneyStagesInFileStore(store) {
  let changed = false;
  if (!Array.isArray(store.journeyStages)) {
    store.journeyStages = [];
    changed = true;
  }
  if (store.journeyStages.length === 0 && store.journey?.length) {
    const names = [
      ...new Set(store.journey.map((item) => normalizeText(item.stage) || '未命名阶段')),
    ].sort((a, b) => a.localeCompare(b, 'zh-CN'));
    store.journeyStages = names.map((name, idx) => ({
      id: `st-${idx + 1}`,
      name,
      sortOrder: idx,
    }));
    for (const item of store.journey) {
      const name = normalizeText(item.stage) || '未命名阶段';
      const st = store.journeyStages.find((s) => s.name === name);
      if (st) {
        item.stageId = st.id;
      }
    }
    changed = true;
  }
  if (store.journeyStages.length && store.journey?.length) {
    for (const item of store.journey) {
      if (!item.stageId) {
        const name = normalizeText(item.stage) || '未命名阶段';
        const st = store.journeyStages.find((s) => s.name === name);
        if (st) {
          item.stageId = st.id;
          changed = true;
        }
      }
    }
  }
  if (changed) {
    await writeFileStore(store);
  }
}

function normalizeConceptGraphNode(node) {
  return {
    name: normalizeText(node?.name),
    category: normalizeText(node?.category, 'core') || 'core',
    desc: normalizeText(node?.desc),
    example: normalizeText(node?.example),
    ...(Number.isFinite(Number(node?.symbolSize))
      ? { symbolSize: normalizeNumber(node.symbolSize, 0) || undefined }
      : {}),
  };
}

function normalizeConceptGraphEdge(edge) {
  return {
    source: normalizeText(edge?.source),
    target: normalizeText(edge?.target),
    relation: normalizeText(edge?.relation),
    description: normalizeText(edge?.description),
  };
}

function normalizeConceptGraphPayload(payload) {
  const nodesInput = Array.isArray(payload?.nodes) ? payload.nodes : [];
  const edgesInput = Array.isArray(payload?.edges) ? payload.edges : [];
  const nodes = nodesInput.map(normalizeConceptGraphNode).filter((node) => node.name);
  const edges = edgesInput.map(normalizeConceptGraphEdge).filter((edge) => edge.source && edge.target);

  if (!nodes.length) {
    throw new Error('至少需要保留一个节点。');
  }

  const nameSet = new Set();
  for (const node of nodes) {
    if (nameSet.has(node.name)) {
      throw new Error(`节点名称重复：${node.name}`);
    }
    nameSet.add(node.name);
  }

  for (const edge of edges) {
    if (!nameSet.has(edge.source) || !nameSet.has(edge.target)) {
      throw new Error(`连线 ${edge.source} -> ${edge.target} 指向了不存在的节点。`);
    }
  }

  return {
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  };
}

async function ensureConceptGraphInFileStore(store) {
  if (!store.conceptGraph) {
    store.conceptGraph = {
      ...defaultConceptGraph,
      updatedAt: new Date().toISOString(),
    };
    await writeFileStore(store);
    return;
  }

  try {
    store.conceptGraph = {
      ...normalizeConceptGraphPayload(store.conceptGraph),
      updatedAt: store.conceptGraph.updatedAt || new Date().toISOString(),
    };
  } catch (_error) {
    store.conceptGraph = {
      ...defaultConceptGraph,
      updatedAt: new Date().toISOString(),
    };
    await writeFileStore(store);
  }
}

async function readFileStore() {
  const raw = await fs.readFile(dataFile, 'utf8');
  const store = JSON.parse(raw);
  if (!hasDatabaseConfig || !pool) {
    await ensureJourneyStagesInFileStore(store);
    await ensureConceptGraphInFileStore(store);
  }
  return store;
}

async function writeFileStore(store) {
  await fs.writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

async function readMysqlJourneyStagesRaw() {
  try {
    const raw = await fs.readFile(journeyStagesMetaFile, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.stages) ? data.stages : [];
  } catch (_error) {
    return [];
  }
}

async function writeMysqlJourneyStages(stages) {
  const sorted = sortJourneyStages(stages).map((s, idx) => ({ ...s, sortOrder: idx }));
  await fs.writeFile(
    journeyStagesMetaFile,
    `${JSON.stringify({ stages: sorted, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );
  return sorted;
}

async function readConceptGraphMetaRaw() {
  try {
    const raw = await fs.readFile(conceptGraphMetaFile, 'utf8');
    const data = JSON.parse(raw);
    return {
      ...normalizeConceptGraphPayload(data),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (_error) {
    return null;
  }
}

async function writeConceptGraphMeta(payload) {
  const normalized = normalizeConceptGraphPayload(payload);
  await fs.writeFile(
    conceptGraphMetaFile,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8',
  );
  return normalized;
}

async function seedMysqlJourneyStagesIfEmpty() {
  let stages = sortJourneyStages(await readMysqlJourneyStagesRaw());
  if (stages.length) {
    return stages;
  }
  const items = await listCollection('journey');
  const names = [
    ...new Set(items.map((item) => normalizeText(item.stage) || '未命名阶段')),
  ].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  stages = names.map((name, idx) => ({
    id: `st-${idx + 1}`,
    name,
    sortOrder: idx,
  }));
  if (stages.length) {
    await writeMysqlJourneyStages(stages);
  }
  return stages;
}

async function getJourneyStages() {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    return sortJourneyStages(store.journeyStages || []);
  }
  return await seedMysqlJourneyStagesIfEmpty();
}

async function getConceptGraph() {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    return store.conceptGraph;
  }

  const existing = await readConceptGraphMetaRaw();
  if (existing) {
    return existing;
  }

  return writeConceptGraphMeta(defaultConceptGraph);
}

async function updateConceptGraph(payload) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    store.conceptGraph = normalizeConceptGraphPayload(payload);
    await writeFileStore(store);
    return store.conceptGraph;
  }

  return writeConceptGraphMeta(payload);
}

function normalizeJourneyStagesPayload(stagesInput) {
  if (!Array.isArray(stagesInput)) {
    throw new Error('stages 须为数组');
  }
  if (stagesInput.length === 0) {
    return [];
  }
  const namesSeen = new Set();
  const idsSeen = new Set();
  const out = stagesInput.map((s, idx) => {
    const name = normalizeText(s.name) || '未命名阶段';
    if (namesSeen.has(name)) {
      throw new Error(`阶段名称重复：${name}`);
    }
    namesSeen.add(name);
    const id = normalizeText(s.id) || `st-${idx + 1}-${Date.now()}`;
    if (idsSeen.has(id)) {
      throw new Error(`阶段 id 重复：${id}`);
    }
    idsSeen.add(id);
    return {
      id,
      name,
      sortOrder: idx,
    };
  });
  return out;
}

function countJourneyItemsForStageFile(store, stageMeta) {
  return store.journey.filter(
    (item) => item.stageId === stageMeta.id || normalizeText(item.stage) === stageMeta.name,
  ).length;
}

async function updateJourneyStagesInFileStore(nextStages) {
  const store = await readFileStore();
  const next = normalizeJourneyStagesPayload(nextStages);
  if (next.length === 0) {
    if (store.journey?.length) {
      throw new Error('已有学习笔记时，请至少保留一个阶段。');
    }
    store.journeyStages = [];
    await writeFileStore(store);
    return [];
  }
  const prev = sortJourneyStages(store.journeyStages || []);

  for (const p of prev) {
    const n = next.find((s) => s.id === p.id);
    if (n && n.name !== p.name) {
      for (const item of store.journey) {
        if (item.stageId === p.id || normalizeText(item.stage) === p.name) {
          item.stage = n.name;
          item.stageId = n.id;
        }
      }
    }
  }

  const removed = prev.filter((p) => !next.some((s) => s.id === p.id));
  for (const r of removed) {
    const n = countJourneyItemsForStageFile(store, r);
    if (n > 0) {
      throw new Error(`阶段「${r.name}」下仍有 ${n} 条笔记，请先将笔记迁到其他阶段后再删除。`);
    }
  }

  store.journeyStages = next;
  await writeFileStore(store);
  return next;
}

async function updateJourneyStagesMysql(nextStages) {
  const prev = await seedMysqlJourneyStagesIfEmpty();
  const next = normalizeJourneyStagesPayload(nextStages);
  if (next.length === 0) {
    const [rows] = await pool.query('SELECT COUNT(*) AS c FROM ai_journey_entries');
    if (rows[0] && Number(rows[0].c) > 0) {
      throw new Error('已有学习笔记时，请至少保留一个阶段。');
    }
    await writeMysqlJourneyStages([]);
    return [];
  }

  for (const p of prev) {
    const n = next.find((s) => s.id === p.id);
    if (n && n.name !== p.name) {
      await pool.query('UPDATE ai_journey_entries SET stage = ? WHERE stage = ?', [n.name, p.name]);
    }
  }

  const removed = prev.filter((p) => !next.some((s) => s.id === p.id));
  for (const r of removed) {
    const [rows] = await pool.query('SELECT COUNT(*) AS c FROM ai_journey_entries WHERE stage = ?', [r.name]);
    if (rows[0] && Number(rows[0].c) > 0) {
      throw new Error(`阶段「${r.name}」下仍有 ${rows[0].c} 条笔记，请先将笔记迁到其他阶段后再删除。`);
    }
  }

  return writeMysqlJourneyStages(next);
}

async function updateJourneyStages(payload) {
  if (!hasDatabaseConfig || !pool) {
    return updateJourneyStagesInFileStore(payload.stages || []);
  }
  return updateJourneyStagesMysql(payload.stages || []);
}

async function resolveJourneyStageFieldsFile(store, payload, current = {}) {
  const stages = store.journeyStages || [];
  const stageIdIn = normalizeText(payload.stageId, current.stageId || '');
  const stageIn = normalizeText(payload.stage, current.stage || '');

  if (stageIdIn) {
    const found = stages.find((x) => x.id === stageIdIn);
    if (found) {
      return { stage: found.name, stageId: found.id };
    }
  }
  if (stageIn) {
    const found = stages.find((x) => x.name === stageIn);
    if (found) {
      return { stage: found.name, stageId: found.id };
    }
    return { stage: stageIn, stageId: stageIdIn || '' };
  }
  const fallback = stages[0];
  if (fallback) {
    return { stage: fallback.name, stageId: fallback.id };
  }
  return { stage: normalizeText(payload.stage, '未命名阶段'), stageId: '' };
}

async function resolveJourneyStageFieldsMysql(payload, current = {}) {
  const stages = await seedMysqlJourneyStagesIfEmpty();
  const stageIdIn = normalizeText(payload.stageId, current.stageId || '');
  const stageIn = normalizeText(payload.stage, current.stage || '');

  if (stageIdIn) {
    const found = stages.find((x) => x.id === stageIdIn);
    if (found) {
      return { stage: found.name, stageId: found.id };
    }
  }
  if (stageIn) {
    const found = stages.find((x) => x.name === stageIn);
    if (found) {
      return { stage: found.name, stageId: found.id };
    }
    return { stage: stageIn, stageId: stageIdIn || '' };
  }
  const fallback = stages[0];
  if (fallback) {
    return { stage: fallback.name, stageId: fallback.id };
  }
  return { stage: normalizeText(payload.stage, '学习阶段'), stageId: '' };
}

async function parseBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw);
}

function createFallbackId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeStack(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

function normalizeNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeStringList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function getCollectionTimestamp(item) {
  return new Date(item.publishedAt || item.updatedAt || '').getTime();
}

function sortCollectionItems(items, options = {}) {
  const { prioritizePinned = true } = options;
  return [...items].sort((left, right) => {
    if (prioritizePinned && Boolean(left.pinned) !== Boolean(right.pinned)) {
      return left.pinned ? -1 : 1;
    }

    const orderDiff = normalizeNumber(left.sortOrder, 0) - normalizeNumber(right.sortOrder, 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return getCollectionTimestamp(right) - getCollectionTimestamp(left);
  });
}

function serializeProjectRow(row) {
  let stack = [];

  if (Array.isArray(row.stack)) {
    stack = row.stack;
  } else if (typeof row.stack === 'string' && row.stack.trim()) {
    try {
      stack = JSON.parse(row.stack);
    } catch (_error) {
      stack = normalizeStack(row.stack);
    }
  }

  return {
    id: String(row.id),
    title: row.title,
    summary: row.summary,
    body: row.body || row.summary || '',
    coverImage: row.cover_image || '',
    pinned: Boolean(row.pinned),
    sortOrder: Number(row.sort_order || 0),
    status: row.status,
    stack,
    sourceUrl: row.source_url || '',
    githubUrl: row.github_url || '',
    updatedAt: row.updated_at,
  };
}

function serializeJourneyRow(row) {
  return {
    id: String(row.id),
    stage: row.stage,
    title: row.title,
    summary: row.summary,
    body: row.body || row.summary || '',
    coverImage: row.cover_image || '',
    pinned: Boolean(row.pinned),
    sortOrder: Number(row.sort_order || 0),
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function serializeInsightRow(row) {
  return {
    id: String(row.id),
    category: row.category,
    title: row.title,
    summary: row.summary,
    body: row.body || row.summary || '',
    coverImage: row.cover_image || '',
    pinned: Boolean(row.pinned),
    sortOrder: Number(row.sort_order || 0),
    publishedAt: row.published_at || '',
    status: row.status,
    updatedAt: row.updated_at,
  };
}

async function listCollection(key, onlyPublished = false) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    const items = store[key] || [];
    const filtered = onlyPublished ? items.filter((item) => item.status === 'published') : items;
    return sortCollectionItems(filtered, { prioritizePinned: key !== 'projects' });
  }

  if (key === 'journey') {
    const [rows] = await pool.query(
      `
        SELECT id, stage, title, summary, status, updated_at
        FROM ai_journey_entries
        ${onlyPublished ? "WHERE status = 'published'" : ''}
        ORDER BY sort_order ASC, updated_at DESC, id DESC
      `,
    );

    return sortCollectionItems(rows.map(serializeJourneyRow), { prioritizePinned: true });
  }

  if (key === 'insights') {
    const [rows] = await pool.query(
      `
        SELECT id, category, title, summary, published_at, status, updated_at
        FROM ai_insights
        ${onlyPublished ? "WHERE status = 'published'" : ''}
        ORDER BY sort_order ASC, published_at DESC, updated_at DESC, id DESC
      `,
    );

    return sortCollectionItems(rows.map(serializeInsightRow), { prioritizePinned: true });
  }

  const [rows] = await pool.query(
    `
      SELECT id, title, summary, status, stack, source_url, github_url, updated_at
      FROM ai_projects
      ${onlyPublished ? "WHERE status = 'published'" : ''}
      ORDER BY sort_order ASC, updated_at DESC, id DESC
    `,
  );

  return sortCollectionItems(rows.map(serializeProjectRow), { prioritizePinned: false });
}

async function getSiteProfile() {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    return store.siteProfile;
  }

  const [rows] = await pool.query(
    `
      SELECT site_name, tagline, hero_title, hero_intro, contact_email, updated_at
      FROM ai_site_profile
      ORDER BY id ASC
      LIMIT 1
    `,
  );

  const row = rows[0];

  if (!row) {
    return {
      siteName: 'AI探索站',
      tagline: '',
      heroTitle: '',
      heroIntro: '',
      contactEmail: '',
      updatedAt: '',
    };
  }

  return {
    siteName: row.site_name,
    tagline: row.tagline,
    heroTitle: row.hero_title,
    heroIntro: row.hero_intro,
    contactEmail: row.contact_email,
    updatedAt: row.updated_at,
  };
}

async function getTaxonomy() {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    return store.taxonomy || { insightCategories: [], projectTags: [], updatedAt: '' };
  }

  return {
    insightCategories: [],
    projectTags: [],
    updatedAt: '',
  };
}

async function updateSiteProfile(payload) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    store.siteProfile = {
      siteName: normalizeText(payload.siteName, store.siteProfile.siteName),
      tagline: normalizeText(payload.tagline, store.siteProfile.tagline),
      heroTitle: normalizeText(payload.heroTitle, store.siteProfile.heroTitle),
      heroIntro: normalizeText(payload.heroIntro, store.siteProfile.heroIntro),
      contactEmail: normalizeText(payload.contactEmail, store.siteProfile.contactEmail),
      updatedAt: new Date().toISOString(),
    };
    await writeFileStore(store);
    return store.siteProfile;
  }

  await pool.query(
    `
      INSERT INTO ai_site_profile (id, site_name, tagline, hero_title, hero_intro, contact_email)
      VALUES (1, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        site_name = VALUES(site_name),
        tagline = VALUES(tagline),
        hero_title = VALUES(hero_title),
        hero_intro = VALUES(hero_intro),
        contact_email = VALUES(contact_email)
    `,
    [
      normalizeText(payload.siteName, 'AI探索站'),
      normalizeText(payload.tagline),
      normalizeText(payload.heroTitle),
      normalizeText(payload.heroIntro),
      normalizeText(payload.contactEmail),
    ],
  );

  return getSiteProfile();
}

async function updateTaxonomy(payload) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    store.taxonomy = {
      insightCategories: normalizeStringList(payload.insightCategories, store.taxonomy?.insightCategories || []),
      projectTags: normalizeStringList(payload.projectTags, store.taxonomy?.projectTags || []),
      updatedAt: new Date().toISOString(),
    };
    await writeFileStore(store);
    return store.taxonomy;
  }

  return getTaxonomy();
}

function fallbackNormalizeCollectionItem(collection, payload, current = {}) {
  const base = {
    id: current.id ?? createFallbackId(collection.slice(0, -1)),
    updatedAt: new Date().toISOString(),
  };

  if (collection === 'journey') {
    return {
      ...base,
      stage: normalizeText(payload.stage, current.stage || '阶段'),
      stageId: normalizeText(payload.stageId, current.stageId || ''),
      title: normalizeText(payload.title, current.title),
      summary: normalizeText(payload.summary, current.summary),
      body: normalizeText(payload.body, current.body || current.summary || ''),
      coverImage: normalizeText(payload.coverImage, current.coverImage || ''),
      pinned: normalizeBoolean(payload.pinned, current.pinned || false),
      sortOrder: normalizeNumber(payload.sortOrder, current.sortOrder || 0),
      status: normalizeText(payload.status, current.status || 'draft') || 'draft',
    };
  }

  if (collection === 'insights') {
    return {
      ...base,
      category: normalizeText(payload.category, current.category || '未分类'),
      title: normalizeText(payload.title, current.title),
      summary: normalizeText(payload.summary, current.summary),
      body: normalizeText(payload.body, current.body || current.summary || ''),
      coverImage: normalizeText(payload.coverImage, current.coverImage || ''),
      pinned: normalizeBoolean(payload.pinned, current.pinned || false),
      sortOrder: normalizeNumber(payload.sortOrder, current.sortOrder || 0),
      publishedAt: normalizeText(payload.publishedAt, current.publishedAt || ''),
      status: normalizeText(payload.status, current.status || 'draft') || 'draft',
    };
  }

  return {
    ...base,
    title: normalizeText(payload.title, current.title),
    summary: normalizeText(payload.summary, current.summary),
    body: normalizeText(payload.body, current.body || current.summary || ''),
    coverImage: normalizeText(payload.coverImage, current.coverImage || ''),
    pinned: normalizeBoolean(payload.pinned, current.pinned || false),
    sortOrder: normalizeNumber(payload.sortOrder, current.sortOrder || 0),
    status: normalizeText(payload.status, current.status || 'planned') || 'planned',
    stack: normalizeStack(payload.stack ?? current.stack),
    sourceUrl: normalizeText(payload.sourceUrl, current.sourceUrl || ''),
    githubUrl: normalizeText(payload.githubUrl, current.githubUrl || ''),
  };
}

async function createCollectionItem(collection, payload) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    let merged = payload;
    if (collection === 'journey') {
      const resolved = await resolveJourneyStageFieldsFile(store, payload, {});
      merged = { ...payload, ...resolved };
    }
    const nextItem = fallbackNormalizeCollectionItem(collection, merged, {});
    store[collection] = [nextItem, ...store[collection]];
    await writeFileStore(store);
    return nextItem;
  }

  if (collection === 'journey') {
    const { stage } = await resolveJourneyStageFieldsMysql(payload, {});
    const [result] = await pool.query(
      `
        INSERT INTO ai_journey_entries (stage, title, summary, status, sort_order)
        VALUES (?, ?, ?, ?, 0)
      `,
      [
        normalizeText(stage, '阶段'),
        normalizeText(payload.title),
        normalizeText(payload.summary),
        normalizeText(payload.status, 'draft') || 'draft',
      ],
    );

    const [rows] = await pool.query(
      'SELECT id, stage, title, summary, status, updated_at FROM ai_journey_entries WHERE id = ?',
      [result.insertId],
    );
    return serializeJourneyRow(rows[0]);
  }

  if (collection === 'insights') {
    const [result] = await pool.query(
      `
        INSERT INTO ai_insights (category, title, summary, published_at, status, sort_order)
        VALUES (?, ?, ?, ?, ?, 0)
      `,
      [
        normalizeText(payload.category, '未分类'),
        normalizeText(payload.title),
        normalizeText(payload.summary),
        normalizeText(payload.publishedAt) || null,
        normalizeText(payload.status, 'draft') || 'draft',
      ],
    );

    const [rows] = await pool.query(
      `
        SELECT id, category, title, summary, published_at, status, updated_at
        FROM ai_insights
        WHERE id = ?
      `,
      [result.insertId],
    );
    return serializeInsightRow(rows[0]);
  }

  const [result] = await pool.query(
    `
      INSERT INTO ai_projects (title, summary, status, stack, source_url, github_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `,
    [
      normalizeText(payload.title),
      normalizeText(payload.summary),
      normalizeText(payload.status, 'planned') || 'planned',
      JSON.stringify(normalizeStack(payload.stack)),
      normalizeText(payload.sourceUrl),
      normalizeText(payload.githubUrl),
    ],
  );

  const [rows] = await pool.query(
    `
      SELECT id, title, summary, status, stack, source_url, github_url, updated_at
      FROM ai_projects
      WHERE id = ?
    `,
    [result.insertId],
  );
  return serializeProjectRow(rows[0]);
}

async function updateCollectionItem(collection, id, payload) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    const current = store[collection].find((item) => item.id === id);

    if (!current) {
      return null;
    }

    let merged = payload;
    if (collection === 'journey') {
      const resolved = await resolveJourneyStageFieldsFile(store, payload, current);
      merged = { ...payload, ...resolved };
    }

    const nextItem = fallbackNormalizeCollectionItem(collection, merged, current);
    store[collection] = store[collection].map((item) => (item.id === id ? nextItem : item));
    await writeFileStore(store);
    return nextItem;
  }

  if (collection === 'journey') {
    const [existingRows] = await pool.query(
      'SELECT id, stage, title, summary, status, updated_at FROM ai_journey_entries WHERE id = ?',
      [Number(id)],
    );

    if (!existingRows[0]) {
      return null;
    }

    const current = serializeJourneyRow(existingRows[0]);
    const { stage } = await resolveJourneyStageFieldsMysql(payload, current);

    const [result] = await pool.query(
      `
        UPDATE ai_journey_entries
        SET stage = ?, title = ?, summary = ?, status = ?
        WHERE id = ?
      `,
      [
        normalizeText(stage, '阶段'),
        normalizeText(payload.title),
        normalizeText(payload.summary),
        normalizeText(payload.status, 'draft') || 'draft',
        Number(id),
      ],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await pool.query(
      'SELECT id, stage, title, summary, status, updated_at FROM ai_journey_entries WHERE id = ?',
      [Number(id)],
    );
    return serializeJourneyRow(rows[0]);
  }

  if (collection === 'insights') {
    const [result] = await pool.query(
      `
        UPDATE ai_insights
        SET category = ?, title = ?, summary = ?, published_at = ?, status = ?
        WHERE id = ?
      `,
      [
        normalizeText(payload.category, '未分类'),
        normalizeText(payload.title),
        normalizeText(payload.summary),
        normalizeText(payload.publishedAt) || null,
        normalizeText(payload.status, 'draft') || 'draft',
        Number(id),
      ],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows] = await pool.query(
      `
        SELECT id, category, title, summary, published_at, status, updated_at
        FROM ai_insights
        WHERE id = ?
      `,
      [Number(id)],
    );
    return serializeInsightRow(rows[0]);
  }

  const [result] = await pool.query(
    `
      UPDATE ai_projects
      SET title = ?, summary = ?, status = ?, stack = ?, source_url = ?, github_url = ?
      WHERE id = ?
    `,
    [
      normalizeText(payload.title),
      normalizeText(payload.summary),
      normalizeText(payload.status, 'planned') || 'planned',
      JSON.stringify(normalizeStack(payload.stack)),
      normalizeText(payload.sourceUrl),
      normalizeText(payload.githubUrl),
      Number(id),
    ],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query(
    `
      SELECT id, title, summary, status, stack, source_url, github_url, updated_at
      FROM ai_projects
      WHERE id = ?
    `,
    [Number(id)],
  );
  return serializeProjectRow(rows[0]);
}

async function deleteCollectionItem(collection, id) {
  if (!hasDatabaseConfig || !pool) {
    const store = await readFileStore();
    const nextItems = store[collection].filter((item) => item.id !== id);

    if (nextItems.length === store[collection].length) {
      return false;
    }

    store[collection] = nextItems;
    await writeFileStore(store);
    return true;
  }

  const tableMap = {
    journey: 'ai_journey_entries',
    insights: 'ai_insights',
    projects: 'ai_projects',
  };

  const [result] = await pool.query(`DELETE FROM ${tableMap[collection]} WHERE id = ?`, [Number(id)]);
  return result.affectedRows > 0;
}

async function buildDashboard() {
  const siteProfile = await getSiteProfile();
  const [journey, insights, projects] = await Promise.all([
    listCollection('journey'),
    listCollection('insights'),
    listCollection('projects'),
  ]);

  return {
    siteName: siteProfile.siteName,
    counts: {
      journey: journey.length,
      insights: insights.length,
      projects: projects.length,
    },
    latest: {
      journey: journey.slice(0, 3),
      insights: insights.slice(0, 3),
      projects: projects.slice(0, 3),
    },
    updatedAt: siteProfile.updatedAt,
  };
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/health' && req.method === 'GET') {
    json(res, 200, {
      ok: true,
      service: 'blog-ai-server',
      storage: hasDatabaseConfig ? 'mysql' : 'file',
    });
    return;
  }

  if (pathname === '/api/dashboard' && req.method === 'GET') {
    json(res, 200, await buildDashboard());
    return;
  }

  if (pathname === '/api/site-profile' && req.method === 'GET') {
    json(res, 200, await getSiteProfile());
    return;
  }

  if (pathname === '/api/taxonomy' && req.method === 'GET') {
    json(res, 200, await getTaxonomy());
    return;
  }

  if (pathname === '/api/site-profile' && req.method === 'PUT') {
    const payload = await parseBody(req);
    json(res, 200, await updateSiteProfile(payload));
    return;
  }

  if (pathname === '/api/concept-graph' && req.method === 'GET') {
    json(res, 200, await getConceptGraph());
    return;
  }

  if (pathname === '/api/concept-graph' && req.method === 'PUT') {
    const payload = await parseBody(req);
    try {
      json(res, 200, await updateConceptGraph(payload));
    } catch (error) {
      json(res, 400, {
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (pathname === '/api/taxonomy' && req.method === 'PUT') {
    const payload = await parseBody(req);
    json(res, 200, await updateTaxonomy(payload));
    return;
  }

  if (pathname === '/api/public/site-profile' && req.method === 'GET') {
    json(res, 200, await getSiteProfile());
    return;
  }

  if (pathname === '/api/public/taxonomy' && req.method === 'GET') {
    json(res, 200, await getTaxonomy());
    return;
  }

  if (pathname === '/api/public/concept-graph' && req.method === 'GET') {
    json(res, 200, await getConceptGraph());
    return;
  }

  if (pathname === '/api/journey-stages' && req.method === 'GET') {
    json(res, 200, { stages: await getJourneyStages() });
    return;
  }

  if (pathname === '/api/journey-stages' && req.method === 'PUT') {
    const payload = await parseBody(req);
    try {
      const stages = await updateJourneyStages(payload);
      json(res, 200, { stages });
    } catch (error) {
      json(res, 400, {
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (pathname === '/api/public/journey-stages' && req.method === 'GET') {
    json(res, 200, { stages: await getJourneyStages() });
    return;
  }

  for (const key of collectionKeys) {
    const collectionPath = `/api/${key}`;
    const publicPath = `/api/public/${key}`;

    if (pathname === collectionPath && req.method === 'GET') {
      json(res, 200, await listCollection(key));
      return;
    }

    if (pathname === publicPath && req.method === 'GET') {
      json(res, 200, await listCollection(key, true));
      return;
    }

    if (pathname === collectionPath && req.method === 'POST') {
      const payload = await parseBody(req);
      json(res, 201, await createCollectionItem(key, payload));
      return;
    }

    if (pathname.startsWith(`${collectionPath}/`)) {
      const id = pathname.replace(`${collectionPath}/`, '');

      if (req.method === 'PUT') {
        const payload = await parseBody(req);
        const updated = await updateCollectionItem(key, id, payload);

        if (!updated) {
          json(res, 404, { message: `Item not found: ${id}` });
          return;
        }

        json(res, 200, updated);
        return;
      }

      if (req.method === 'DELETE') {
        const deleted = await deleteCollectionItem(key, id);

        if (!deleted) {
          json(res, 404, { message: `Item not found: ${id}` });
          return;
        }

        json(res, 200, { ok: true, id });
        return;
      }
    }
  }

  json(res, 404, { message: 'Route not found', pathname });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    json(res, 500, {
      message: 'Internal server error',
      detail: error instanceof Error ? error.message : String(error),
    });
  });
});

server.listen(port, () => {
  console.log(`blog-ai-server listening on http://localhost:${port}`);
});
