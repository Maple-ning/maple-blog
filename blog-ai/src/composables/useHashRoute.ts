import { computed, onMounted, onUnmounted, ref } from 'vue';
import { routes } from '../site';

const defaultPath = routes[0].path;

function getHashPath(hash: string): string {
  const raw = hash.replace(/^#/, '').trim();
  if (!raw) return defaultPath;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function normalizePath(hash: string): string {
  const hashPath = getHashPath(hash);

  if (hashPath === defaultPath) {
    return defaultPath;
  }

  const matched = routes.find((route) =>
    route.path === '/'
      ? hashPath === route.path
      : hashPath === route.path || hashPath.startsWith(`${route.path}/`),
  );

  return matched?.path ?? defaultPath;
}

function routeHref(path: string): string {
  return `#${path}`;
}

export function useHashRoute() {
  const currentPath = ref(defaultPath);
  const currentHashPath = ref(defaultPath);

  const syncRoute = () => {
    const hashPath = getHashPath(window.location.hash);
    const nextPath = normalizePath(window.location.hash);
    currentHashPath.value = hashPath;
    currentPath.value = nextPath;

    if (window.location.hash !== routeHref(hashPath)) {
      window.location.hash = routeHref(hashPath);
    }
  };

  onMounted(() => {
    if (!window.location.hash) {
      window.location.hash = routeHref(defaultPath);
    }

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
  });

  onUnmounted(() => {
    window.removeEventListener('hashchange', syncRoute);
  });

  const currentRoute = computed(
    () => routes.find((route) => route.path === currentPath.value) ?? routes[0],
  );

  const currentItemId = computed(() => {
    const prefix = currentPath.value === '/' ? '' : `${currentPath.value}/`;
    if (!prefix || !currentHashPath.value.startsWith(prefix)) {
      return '';
    }
    return decodeURIComponent(currentHashPath.value.slice(prefix.length));
  });

  return {
    routes,
    currentPath,
    currentHashPath,
    currentItemId,
    currentRoute,
    routeHref,
  };
}
