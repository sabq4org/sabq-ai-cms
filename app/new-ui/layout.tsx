"use client";

import UserHeader from "@/components/user/UserHeader";
import UserFooter from "@/components/user/UserFooter";
import React from "react";

export default function NewUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        minHeight: '100vh',
        background: 'hsl(var(--bg-elevated))',
        paddingTop: '72px', // To offset for the fixed header
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        <UserHeader />
        <main style={{
          flex: 1,
          padding: '16px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          background: 'transparent'
        }}>
          {children}
        </main>
        <UserFooter />
      </div>
    </>
  );
}
