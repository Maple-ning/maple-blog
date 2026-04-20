import type { Component } from "vue";

export type RouteKey = "home" | "journey" | "insights" | "projects";

export interface AppRouteMeta {
  key: RouteKey;
  label: string;
  path: string;
  title: string;
  description: string;
}

export interface AppRouteRecord extends AppRouteMeta {
  component: Component;
}
