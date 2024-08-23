export const buildUri = (
  baseUri: string,
  params: Record<string, string | undefined>,
) => {
  const url = new URL(baseUri);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, encodeURIComponent(value));
    }
  });
  return url.toString();
};
