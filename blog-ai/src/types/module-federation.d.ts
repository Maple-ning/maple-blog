declare module "mapleShares/Switch" {
  import type { DefineComponent } from "vue";

  type SwitchSize = "sm" | "md";

  interface RemoteSwitchProps {
    checked?: boolean;
    disabled?: boolean;
    size?: SwitchSize;
    title?: string;
  }

  const component: DefineComponent<RemoteSwitchProps>;
  export default component;
}

declare module "mapleShares/ConceptGraph" {
  import type { DefineComponent } from "vue";

  interface ConceptGraphNode {
    name: string;
    category: string;
    desc: string;
    example: string;
    symbolSize?: number;
  }

  interface ConceptGraphEdge {
    source: string;
    target: string;
    relation: string;
    description: string;
  }

  interface RemoteConceptGraphProps {
    data?: {
      nodes: ConceptGraphNode[];
      edges: ConceptGraphEdge[];
    } | null;
    dataUrl?: string;
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    showToolbox?: boolean;
    footerTip?: string;
    height?: number | string;
    initialInfoTitle?: string;
    initialInfoText?: string;
    initialInfoHint?: string;
    loadingText?: string;
    emptyText?: string;
    categoryLabels?: Record<string, string>;
  }

  const component: DefineComponent<RemoteConceptGraphProps>;
  export default component;
}
