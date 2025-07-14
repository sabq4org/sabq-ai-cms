// Build Version Component
// Force Vercel Rebuild - v0.2.0
// Last Updated: 2025-01-16T18:45:00Z

export const BUILD_VERSION = '0.2.0';
export const BUILD_DATE = '2025-01-16T18:45:00Z';
export const BUILD_ID = 'v2-2025-01-16-18-45';

export default function BuildVersion() {
  return (
    <div style={{ display: 'none' }}>
      <meta name="build-version" content={BUILD_VERSION} />
      <meta name="build-date" content={BUILD_DATE} />
      <meta name="build-id" content={BUILD_ID} />
    </div>
  );
} 