// Build Version Component
// Force Vercel Rebuild - v0.2.1
// Last Updated: 2025-07-15

export const BUILD_VERSION = '0.2.2';
export const BUILD_DATE = new Date().toISOString();
export const BUILD_ID = `v2-${Date.now()}`;

export default function BuildVersion() {
  return (
    <div style={{ display: 'none' }}>
      <meta name="build-version" content={BUILD_VERSION} />
      <meta name="build-date" content={BUILD_DATE} />
      <meta name="build-id" content={BUILD_ID} />
    </div>
  );
} 