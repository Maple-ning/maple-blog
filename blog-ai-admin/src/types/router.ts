import type { Component } from "vue";

export type AdminRoutePath =
  | "/"
  | "/journey"
  | "/insights"
  | "/projects"
  | "/concept-graph"
  | "/site";

export interface AdminRouteMeta {
  path: AdminRoutePath;
  label: string;
}

export interface AdminRouteRecord extends AdminRouteMeta {
  component: Component;
}
