/** Prefix a public asset path with the configured basePath (set in next.config.ts). */
export const withBasePath = (path: string): string => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
