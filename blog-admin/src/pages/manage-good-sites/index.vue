<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import type { AdminGoodSitePrimaryCategory } from '@/types/content';
import { useBlogAdmin } from '@/composables/useBlogAdmin';

type TreeNodeType = 'primary' | 'secondary' | 'site';

interface GoodSiteTreeNode {
  key: string;
  title: string;
  type: TreeNodeType;
  id: number;
  children?: GoodSiteTreeNode[];
}

const {
  goodSites,
  goodSiteCategoryTree,
  upsertGoodSite,
  deleteGoodSite,
  deletePrimaryGoodSiteCategory,
  deleteSecondaryGoodSiteCategory,
  createPrimaryGoodSiteCategory,
  createSecondaryGoodSiteCategory,
  init,
} = useBlogAdmin();

const siteModalOpen = ref<boolean>(false);
const primaryCategoryModalOpen = ref<boolean>(false);
const secondaryCategoryModalOpen = ref<boolean>(false);
const creatingPrimaryCategory = ref<boolean>(false);
const creatingSecondaryCategory = ref<boolean>(false);
const expandedKeys = ref<string[]>([]);
const selectedTreeKey = ref<string>('');

const primaryCategoryForm = reactive({
  label: '',
});

const secondaryCategoryForm = reactive({
  primaryCategory: '',
  label: '',
});

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  url: '',
  description: '',
  primaryCategory: '',
  secondaryCategory: '',
  category: '',
  sortOrder: 0,
});

const primaryCategoryOptions = computed<string[]>(() =>
  goodSiteCategoryTree.value.map((item) => item.label),
);

const secondaryCategoryOptions = computed<string[]>(() => {
  const currentPrimary = goodSiteCategoryTree.value.find(
    (item) => item.label === form.primaryCategory,
  );
  return currentPrimary ? currentPrimary.children.map((child) => child.label) : [];
});

const treeData = computed<GoodSiteTreeNode[]>(() => {
  return goodSiteCategoryTree.value.map((primary) => {
    const secondaryNodes = primary.children.map((secondary) => {
      const siteNodes = goodSites.value
        .filter(
          (site) =>
            site.primaryCategory === primary.label &&
            site.secondaryCategory === secondary.label,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'zh-CN'))
        .map((site) => ({
          key: `site-${site.id}`,
          title: site.title,
          type: 'site' as const,
          id: site.id,
        }));

      return {
        key: `secondary-${secondary.id}`,
        title: secondary.label,
        type: 'secondary' as const,
        id: secondary.id,
        children: siteNodes,
      };
    });

    return {
      key: `primary-${primary.id}`,
      title: primary.label,
      type: 'primary' as const,
      id: primary.id,
      children: secondaryNodes,
    };
  });
});

const currentNode = computed<GoodSiteTreeNode | null>(() => {
  const walk = (nodes: GoodSiteTreeNode[]): GoodSiteTreeNode | null => {
    for (const node of nodes) {
      if (node.key === selectedTreeKey.value) return node;
      if (node.children && node.children.length > 0) {
        const matched = walk(node.children);
        if (matched) return matched;
      }
    }
    return null;
  };
  return walk(treeData.value);
});

const currentPrimaryDetail = computed<AdminGoodSitePrimaryCategory | null>(() => {
  if (!currentNode.value) return goodSiteCategoryTree.value[0] ?? null;
  if (currentNode.value.type === 'primary') {
    return goodSiteCategoryTree.value.find((item) => item.id === currentNode.value?.id) ?? null;
  }
  if (currentNode.value.type === 'secondary') {
    return (
      goodSiteCategoryTree.value.find((item) =>
        item.children.some((child) => child.id === currentNode.value?.id),
      ) ?? null
    );
  }
  const site = goodSites.value.find((item) => item.id === currentNode.value?.id);
  if (!site) return null;
  return goodSiteCategoryTree.value.find((item) => item.label === site.primaryCategory) ?? null;
});

const currentSecondaryLabel = computed<string | null>(() => {
  if (!currentNode.value) return null;
  if (currentNode.value.type === 'secondary') return currentNode.value.title;
  if (currentNode.value.type === 'site') {
    const site = goodSites.value.find((item) => item.id === currentNode.value?.id);
    return site?.secondaryCategory ?? null;
  }
  return null;
});

const filteredSites = computed(() => {
  const primaryLabel = currentPrimaryDetail.value?.label;
  const secondaryLabel = currentSecondaryLabel.value;

  return goodSites.value.filter((site) => {
    if (primaryLabel && site.primaryCategory !== primaryLabel) return false;
    if (secondaryLabel && site.secondaryCategory !== secondaryLabel) return false;
    return true;
  });
});

watch(
  () => form.primaryCategory,
  () => {
    const options = secondaryCategoryOptions.value;
    if (!options.includes(form.secondaryCategory)) {
      form.secondaryCategory = options[0] ?? '';
      form.category = form.secondaryCategory;
    }
  },
);

watch(
  () => form.secondaryCategory,
  (nextValue: string) => {
    form.category = nextValue;
  },
);

const resetSiteForm = (): void => {
  form.id = undefined;
  form.title = '';
  form.url = '';
  form.description = '';
  form.primaryCategory = currentPrimaryDetail.value?.label ?? primaryCategoryOptions.value[0] ?? '';
  form.secondaryCategory =
    currentSecondaryLabel.value ?? secondaryCategoryOptions.value[0] ?? '';
  form.category = form.secondaryCategory;
  form.sortOrder = 0;
};

const openCreateSite = (): void => {
  resetSiteForm();
  siteModalOpen.value = true;
};

const editSite = (id: number): void => {
  const site = goodSites.value.find((item) => item.id === id);
  if (!site) return;
  form.id = site.id;
  form.title = site.title;
  form.url = site.url;
  form.description = site.description;
  form.primaryCategory = site.primaryCategory;
  form.secondaryCategory = site.secondaryCategory;
  form.category = site.category;
  form.sortOrder = site.sortOrder;
  siteModalOpen.value = true;
};

const submitSite = async (): Promise<void> => {
  if (!form.title || !form.url || !form.primaryCategory || !form.secondaryCategory) {
    message.warning('请完整填写站点与所属分类');
    return;
  }

  await upsertGoodSite({
    id: form.id,
    title: form.title,
    url: form.url,
    description: form.description,
    primaryCategory: form.primaryCategory,
    secondaryCategory: form.secondaryCategory,
    category: form.secondaryCategory,
    sortOrder: Number(form.sortOrder) || 0,
  });

  siteModalOpen.value = false;
  resetSiteForm();
};

const openPrimaryCategoryModal = (): void => {
  primaryCategoryForm.label = '';
  primaryCategoryModalOpen.value = true;
};

const submitPrimaryCategory = async (): Promise<void> => {
  const label = primaryCategoryForm.label.trim();
  if (!label) {
    message.warning('请输入一级分类名称');
    return;
  }
  creatingPrimaryCategory.value = true;
  try {
    await createPrimaryGoodSiteCategory(label);
    primaryCategoryModalOpen.value = false;
    primaryCategoryForm.label = '';
  } finally {
    creatingPrimaryCategory.value = false;
  }
};

const openSecondaryCategoryModal = (): void => {
  secondaryCategoryForm.primaryCategory =
    currentPrimaryDetail.value?.label ?? primaryCategoryOptions.value[0] ?? '';
  secondaryCategoryForm.label = '';
  secondaryCategoryModalOpen.value = true;
};

const submitSecondaryCategory = async (): Promise<void> => {
  const primaryCategory = secondaryCategoryForm.primaryCategory;
  const label = secondaryCategoryForm.label.trim();
  if (!primaryCategory || !label) {
    message.warning('请选择所属一级分类并填写二级分类名称');
    return;
  }
  creatingSecondaryCategory.value = true;
  try {
    await createSecondaryGoodSiteCategory(primaryCategory, label);
    secondaryCategoryModalOpen.value = false;
    secondaryCategoryForm.label = '';
  } finally {
    creatingSecondaryCategory.value = false;
  }
};

const removePrimaryCategory = async (id: number): Promise<void> => {
  await deletePrimaryGoodSiteCategory(id);
  if (selectedTreeKey.value === `primary-${id}`) {
    selectedTreeKey.value = '';
  }
};

const removeSecondaryCategory = async (id: number): Promise<void> => {
  await deleteSecondaryGoodSiteCategory(id);
  if (selectedTreeKey.value === `secondary-${id}`) {
    selectedTreeKey.value = '';
  }
};

const onTreeSelect = (selectedKeys: (string | number)[]): void => {
  selectedTreeKey.value = String(selectedKeys[0] ?? '');
};

onMounted(async () => {
  await init();
  expandedKeys.value = treeData.value.map((item) => item.key);
  selectedTreeKey.value = treeData.value[0]?.key ?? '';
  resetSiteForm();
});
</script>

<template>
  <section class="space-y-6">
    <a-card title="友链树形管理">
      <template #extra>
        <a-space>
          <a-button @click="openPrimaryCategoryModal">
            <template #icon>
              <PlusOutlined />
            </template>
            新增一级分类
          </a-button>
          <a-button @click="openSecondaryCategoryModal" :disabled="primaryCategoryOptions.length === 0">
            <template #icon>
              <PlusOutlined />
            </template>
            新增二级分类
          </a-button>
          <a-button type="primary" @click="openCreateSite" :disabled="secondaryCategoryOptions.length === 0">
            <template #icon>
              <LinkOutlined />
            </template>
            新增友链
          </a-button>
        </a-space>
      </template>

      <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">分类树</p>
              <p class="mt-1 text-xs text-slate-500">一级分类 / 二级分类 / 友链站点</p>
            </div>
          </div>

          <a-empty v-if="treeData.length === 0" description="暂无分类" />

          <a-tree
            v-else
            v-model:expandedKeys="expandedKeys"
            :selected-keys="selectedTreeKey ? [selectedTreeKey] : []"
            :tree-data="treeData"
            block-node
            @select="onTreeSelect"
          >
            <template #title="{ dataRef }">
              <div class="flex items-center gap-2">
                <FolderOpenOutlined v-if="dataRef.type !== 'site'" class="text-slate-400" />
                <LinkOutlined v-else class="text-slate-400" />
                <span class="min-w-0 flex-1 truncate">{{ dataRef.title }}</span>
                <template v-if="dataRef.type === 'primary'">
                  <a-popconfirm
                    title="确认删除该一级分类吗？"
                    description="删除后将同步删除其下所有二级分类与友链站点。"
                    @confirm="removePrimaryCategory(dataRef.id)"
                  >
                    <a-button type="text" danger size="small">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-popconfirm>
                </template>
                <template v-else-if="dataRef.type === 'secondary'">
                  <a-popconfirm
                    title="确认删除该二级分类吗？"
                    description="删除后将同步删除该分类下的所有友链站点。"
                    @confirm="removeSecondaryCategory(dataRef.id)"
                  >
                    <a-button type="text" danger size="small">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-popconfirm>
                </template>
                <template v-else-if="dataRef.type === 'site'">
                  <a-button type="text" size="small" @click.stop="editSite(dataRef.id)">
                    <template #icon>
                      <EditOutlined />
                    </template>
                  </a-button>
                  <a-popconfirm title="确认删除该友链吗？" @confirm="deleteGoodSite(dataRef.id)">
                    <a-button type="text" danger size="small" @click.stop>
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-popconfirm>
                </template>
              </div>
            </template>
          </a-tree>
        </div>

        <div class="space-y-4">
          <a-card>
            <template #title>
              <div class="flex items-center gap-2">
                <FolderOpenOutlined class="text-slate-400" />
                <span>当前分类信息</span>
              </div>
            </template>

            <div v-if="currentPrimaryDetail" class="space-y-3">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400">一级分类</p>
                <p class="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {{ currentPrimaryDetail.label }}
                </p>
              </div>
              <div v-if="currentSecondaryLabel">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400">二级分类</p>
                <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">{{ currentSecondaryLabel }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-400">友链数量</p>
                <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">{{ filteredSites.length }} 条</p>
              </div>
            </div>

            <a-empty v-else description="请选择左侧节点" />
          </a-card>

          <a-card title="当前节点下的友链">
            <div class="admin-list">
              <article v-for="item in filteredSites" :key="item.id" class="admin-list-item">
                <div class="admin-list-top">
                  <div>
                    <p class="admin-list-title">{{ item.title }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-2">
                      <a-tag color="gold">{{ item.primaryCategory }}</a-tag>
                      <a-tag color="blue">{{ item.secondaryCategory }}</a-tag>
                      <span class="text-xs text-slate-500">同分类排序：{{ item.sortOrder }}</span>
                    </div>
                  </div>
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noreferrer noopener"
                    class="text-xs text-blue-600 hover:underline"
                  >
                    {{ item.url }}
                  </a>
                </div>
                <p v-if="item.description" class="admin-list-desc">{{ item.description }}</p>
                <div class="admin-list-actions">
                  <a-button size="small" @click="editSite(item.id)">编辑</a-button>
                  <a-popconfirm title="确认删除该友链吗？" @confirm="deleteGoodSite(item.id)">
                    <a-button danger size="small">删除</a-button>
                  </a-popconfirm>
                </div>
              </article>
            </div>

            <a-empty v-if="filteredSites.length === 0" description="当前节点下暂无友链" />
          </a-card>
        </div>
      </div>
    </a-card>

    <a-modal
      v-model:open="siteModalOpen"
      :title="form.id ? '编辑友链' : '新增友链'"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitSite"
      @cancel="resetSiteForm"
    >
      <div class="grid gap-3">
        <a-input v-model:value="form.title" placeholder="站点名称" />
        <a-input v-model:value="form.url" placeholder="链接，例如 https://example.com" />
        <a-select v-model:value="form.primaryCategory" placeholder="选择一级分类">
          <a-select-option v-for="primary in primaryCategoryOptions" :key="primary" :value="primary">
            {{ primary }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="form.secondaryCategory"
          placeholder="选择二级分类"
          :disabled="secondaryCategoryOptions.length === 0"
        >
          <a-select-option
            v-for="secondary in secondaryCategoryOptions"
            :key="secondary"
            :value="secondary"
          >
            {{ secondary }}
          </a-select-option>
        </a-select>
        <a-input-number
          v-model:value="form.sortOrder"
          class="w-full"
          :min="0"
          placeholder="同分类内排序（越小越靠前）"
        />
        <a-textarea v-model:value="form.description" :rows="3" placeholder="简介（可选）" />
      </div>
    </a-modal>

    <a-modal
      v-model:open="primaryCategoryModalOpen"
      title="新增一级分类"
      ok-text="保存"
      cancel-text="取消"
      :confirm-loading="creatingPrimaryCategory"
      @ok="submitPrimaryCategory"
    >
      <a-input v-model:value="primaryCategoryForm.label" placeholder="例如：前端 / 后端 / Python" />
    </a-modal>

    <a-modal
      v-model:open="secondaryCategoryModalOpen"
      title="新增二级分类"
      ok-text="保存"
      cancel-text="取消"
      :confirm-loading="creatingSecondaryCategory"
      @ok="submitSecondaryCategory"
    >
      <div class="grid gap-3">
        <a-select
          v-model:value="secondaryCategoryForm.primaryCategory"
          placeholder="选择所属一级分类"
        >
          <a-select-option v-for="primary in primaryCategoryOptions" :key="primary" :value="primary">
            {{ primary }}
          </a-select-option>
        </a-select>
        <a-input v-model:value="secondaryCategoryForm.label" placeholder="例如：JavaScript / Vue / React" />
      </div>
    </a-modal>
  </section>
</template>
