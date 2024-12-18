// Enhanced route configuration with more robust typing
interface RouteConfig {
  getPath: (params?: Record<string, string>) => string;
  includeBackButton: boolean; // Use boolean instead of string
}

// More comprehensive route mapping
const ROUTE_MAPPING: Record<string, RouteConfig> = {
  "/playlist/": {
    getPath: (params) => {
      const playlistId = params?.playlistId ? `${params.playlistId}/` : "";
      return `/playlist/${playlistId}`;
    },
    includeBackButton: true,
  },
  "/album/": {
    getPath: (params) => {
      const albumId = params?.albumId ? `${params.albumId}/` : "";
      return `/album/${albumId}`;
    },
    includeBackButton: true,
  },
  "/verification-link": {
    getPath: () => `/auth/email-ver`,
    includeBackButton: false,
  },
};

export function redirectSystemPath({
  path,
  initial = false,
}: {
  path: string;
  initial?: boolean;
}): string {
  try {
    // More comprehensive route matching
    const matchedRoute = Object.entries(ROUTE_MAPPING).find(([routeKey]) =>
      path.includes(routeKey),
    );

    if (matchedRoute) {
      const [routeKey, routeConfig] = matchedRoute;

      // Extract parameters
      const params = extractPathParams(path, routeKey);

      // Generate new path
      const newPathSegment = routeConfig.getPath(params);
      const finalPath = path.replace(routeKey, newPathSegment);

      // Convert includeBackButton to string for URL param
      const finalParams = new URLSearchParams({
        includeBackButton: String(routeConfig.includeBackButton),
      });

      return `${finalPath}?${finalParams.toString()}`;
    }

    // If no route matches, return original path or a default route
    return initial ? "/" : path;
  } catch (error) {
    // Do not crash inside this function! Instead you should redirect users
    // to a custom route to handle unexpected errors, where they are able to report the incident
    console.error("Deep link routing error:", error);
    return "/unexpected-error";
  }
}

/**
 * Helper function to extract path parameters
 */
function extractPathParams(
  path: string,
  routeKey: string,
): Record<string, string> {
  const params: Record<string, string> = {};
  const pathSegments = path.split("/").filter(Boolean);
  const routeSegments = routeKey.split("/").filter(Boolean);

  pathSegments.forEach((segment, index) => {
    if (index >= routeSegments.length) {
      params[`param${index - routeSegments.length + 1}`] = segment;
    }
  });

  return params;
}
