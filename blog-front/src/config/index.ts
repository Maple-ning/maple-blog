export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api-blog',
  aiPortalUrl: import.meta.env.VITE_AI_PORTAL_URL || '/ai/',
  appTitle: import.meta.env.VITE_APP_TITLE || '枫叶小站',
  mapleSharesDocsUrl: import.meta.env.VITE_MAPLE_SHARES_DOCS_URL || '/maple-shares/',
  requestTimeout: 10_000,
} as const;
