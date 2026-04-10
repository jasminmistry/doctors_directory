const DEFAULT_BASE_URL = "https://staging.consentz.com";

export const getBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || DEFAULT_BASE_URL;

export const toDirectoryCanonical = (pathname: string): string => {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getBaseUrl()}/directory${normalized}`;
};
