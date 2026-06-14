/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEFAULT_PASSWORD: string;
  readonly VITE_OPERATOR_USER_DEMO: string;
  readonly VITE_OPERATOR_USER_PASS: string;
  readonly VITE_ADMIN_USER_DEMO: string;
  readonly VITE_ADMIN_USER_PASS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
