import { computed, onMounted, onUnmounted, ref } from 'vue';
import { adminRoutes } from '../site';
import type { AdminRoutePath } from '../site';

const defaultPath: AdminRoutePath = adminRoutes[0].path;

function normalizePath(hash: string): AdminRoutePath {
  const raw = hash.replace(/^#/, '').trim();

  if (!raw) {
    return defaultPath;
  }

  const path = raw.startsWith('/') ? raw : `/${raw}`;
  if (path === '/posts') {
    return '/journey';
  }
  return adminRoutes.find((route) => route.path === path)?.path ?? defaultPath;
}

export function useHashRoute() {
  const currentPath = ref<AdminRoutePath>(defaultPath);

  const routeHref = (path: string) => `#${path}`;

  const syncPath = () => {
    const nextPath = normalizePath(window.location.hash);
    currentPath.value = nextPath;

    if (window.location.hash !== routeHref(nextPath)) {
      window.location.hash = routeHref(nextPath);
    }
  };

  onMounted(() => {
    if (!window.location.hash) {
      window.location.hash = routeHref(defaultPath);
    }

    syncPath();
    window.addEventListener('hashchange', syncPath);
  });

  onUnmounted(() => {
    window.removeEventListener('hashchange', syncPath);
  });

  const currentRoute = computed(
    () => adminRoutes.find((route) => route.path === currentPath.value) ?? adminRoutes[0],
  );

  return {
    adminRoutes,
    currentPath,
    currentRoute,
    routeHref,
  };
}
