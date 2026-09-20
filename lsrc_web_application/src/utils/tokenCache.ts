// utils/tokenCache.ts
let accessTokenCache: string | null = null;

export const getCachedToken = () => accessTokenCache;

export const setCachedToken = (token: string | null) => {
    accessTokenCache = token;
};