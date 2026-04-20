/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AI_PORTAL_URL?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_MAPLE_SHARES_REMOTE?: string;
  readonly VITE_MAPLE_SHARES_DOCS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
