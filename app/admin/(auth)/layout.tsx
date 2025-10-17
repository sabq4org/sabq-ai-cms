/**
 * Layout for authentication pages
 * This layout bypasses the admin authentication check
 */

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  // No authentication check here - this is for login/signup pages
  return <>{children}</>;
}

