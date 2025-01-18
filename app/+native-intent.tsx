// Types for route configuration
interface RouteConfig {
  getPath: () => string;
  includeBackButton: boolean;
  preserveParams?: boolean; // Flag to indicate if URL params should be preserved
  paramMapping?: Record<string, string>; // Optional mapping of param names
}

// Enhanced route mapping with param handling configuration
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
    preserveParams: true, // Preserve URL params for email verification
    paramMapping: {
      mode: "mode",
      oobCode: "oobCode",
      apiKey: "apiKey",
      lang: "lang",
    },
  },
};

interface RedirectOptions {
  path: string;
  initial?: boolean;
  fullUrl?: string; // Optional full URL for param extraction
}

export function redirectSystemPath({
  path,
  initial = false,
  fullUrl,
}: RedirectOptions): string {
  try {
    // Find matching route
    const matchedRoute = Object.entries(ROUTE_MAPPING).find(([routeKey]) =>
      path.includes(routeKey),
    );

    if (matchedRoute) {
      const [routeKey, routeConfig] = matchedRoute;
      const newPathSegment = routeConfig.getPath();
      const finalPath = path.replace(routeKey, newPathSegment);

      // Initialize params with includeBackButton
      const finalParams = new URLSearchParams({
        includeBackButton: String(routeConfig.includeBackButton),
      });

      // If preserveParams is true and we have a full URL, preserve specified parameters
      if (routeConfig.preserveParams && fullUrl) {
        const sourceUrl = new URL(fullUrl);
        const sourceParams = sourceUrl.searchParams;

        // Copy over mapped parameters if they exist
        if (routeConfig.paramMapping) {
          Object.entries(routeConfig.paramMapping).forEach(
            ([sourceParam, targetParam]) => {
              const value = sourceParams.get(sourceParam);
              if (value) {
                finalParams.set(targetParam, value);
              }
            },
          );
        }
      }

      return `${finalPath}?${finalParams.toString()}`;
    }

    // Return default path if no match
    return initial ? "/" : path;
  } catch (error) {
    console.error("Deep link routing error:", error);
    return "/unexpected-error";
  }
}
