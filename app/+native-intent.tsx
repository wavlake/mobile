import { getArtistByName } from "@/utils";

// Enhanced route configuration with more robust typing
interface RouteConfig {
  getPath: () => string;
  includeBackButton: boolean; // Use boolean instead of string
}

const UNSUPPORTED_DEEP_LINK = [
  "/catalog",
  "/new",
  "/not-found",
  "/onboarding",
  "/login",
  "/activity",
  "/account",
  "/artists",
  "/top",
  "/transactions",
  "/zbd-login",
  "/podcasts",
  "/register",
  "/reset",
  "/settings",
  "/shows",
];

const OTHER = [
  "/playlist/*",
  "/track/*",
  "/album/*",
  "/verification-link/*",
  "/btc24/*",
  "/episode/*",
  "/feed/*",
  "/profile/*",
  "/studio/*",
  "/podcast/*",
];
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

export async function redirectSystemPath({
  path,
  initial = false,
}: {
  path: string;
  initial?: boolean;
}): Promise<string> {
  try {
    // Check if this is an artist URL
    if (
      UNSUPPORTED_DEEP_LINK.some((unsupported) => path.includes(unsupported))
    ) {
      console.log("Unsupported deep link:", path);
      return initial ? "/" : path;
    }

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

    // If no route matches, check if this is an artist URL
    const artistName = path.slice(1); // Remove leading slash
    const artist = await getArtistByName(artistName);

    if (artist) {
      const params = new URLSearchParams({
        headerTitle: artistName,
        includeBackButton: "true",
      });
      // Redirect to artist page
      return `/artist/${artist.id}?${params.toString()}`;
    } else {
      // Artist not found, redirect to home
      return initial ? "/" : path;
    }
  } catch (error) {
    // Do not crash inside this function! Instead you should redirect users
    // to a custom route to handle unexpected errors, where they are able to report the incident
    console.error("Deep link routing error:", error);
    return "/unexpected-error";
  }
}
