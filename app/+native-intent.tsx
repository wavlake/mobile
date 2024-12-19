// Enhanced route configuration with more robust typing
interface RouteConfig {
  getPath: () => string;
  includeBackButton: boolean; // Use boolean instead of string
}

// route mapping that maps the website path to the app path
// this is used to redirect users to the correct page in the app
// most of the paths are the same, but some paths have different routes in the app
const ROUTE_MAPPING: Record<string, RouteConfig> = {
  "/playlist/": {
    getPath: () => `/playlist/`,
    includeBackButton: true,
  },
  "/album/": {
    getPath: () => `/album/`,
    includeBackButton: true,
  },
  "/track/": {
    getPath: () => `/track/`,
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

      // Generate new path
      const newPathSegment = routeConfig.getPath();
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
