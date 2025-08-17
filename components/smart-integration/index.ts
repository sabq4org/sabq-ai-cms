// ===========================================
// Smart Integration System - Phase 6
// Complete UI Integration & Real-time Components
// ===========================================

// Main Provider
export { default as SmartIntegrationProvider } from './SmartIntegrationProvider';
export * from './SmartIntegrationProvider';

// Core Smart Components
export { default as SmartRecommendations } from './SmartRecommendations';
export { default as IntelligentNotifications } from './IntelligentNotifications';
export { default as UserProfileDashboard } from './UserProfileDashboard';
export { default as PersonalizationSettings } from './PersonalizationSettings';
export { default as AdminControlPanel } from './AdminControlPanel';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';
export { default as ContentManagement } from './ContentManagement';
export { default as RealTimeUpdates } from './RealTimeUpdates';

// Page Wrappers
export {
  SmartPageWrapper,
  AdminPageWrapper,
  ContentManagementWrapper,
  ProfilePageWrapper,
  SettingsPageWrapper,
} from './SmartIntegrationProvider';

// Hooks and Context
export { useSmartIntegration } from './SmartIntegrationProvider';

// Component Registry
export { SmartComponentsRegistry } from './SmartIntegrationProvider';

// ===========================================
// Usage Examples
// ===========================================

/*
// 1. App-level integration:
import { SmartIntegrationProvider } from '@/components/smart-integration';

function App() {
  return (
    <SmartIntegrationProvider>
      <YourAppContent />
    </SmartIntegrationProvider>
  );
}

// 2. Page-level integration:
import { SmartPageWrapper } from '@/components/smart-integration';

function HomePage() {
  return (
    <SmartPageWrapper pageType="home" enableRecommendations>
      <YourPageContent />
    </SmartPageWrapper>
  );
}

// 3. Admin pages:
import { AdminPageWrapper } from '@/components/smart-integration';

function AdminDashboard() {
  return (
    <AdminPageWrapper>
      <YourAdminContent />
    </AdminPageWrapper>
  );
}

// 4. Individual components:
import { 
  SmartRecommendations, 
  IntelligentNotifications,
  RealTimeUpdates 
} from '@/components/smart-integration';

function CustomPage() {
  return (
    <div>
      <IntelligentNotifications />
      <SmartRecommendations />
      <RealTimeUpdates />
    </div>
  );
}

// 5. Using the hook:
import { useSmartIntegration } from '@/components/smart-integration';

function CustomComponent() {
  const { isInitialized, componentsLoaded, theme } = useSmartIntegration();
  
  if (!isInitialized) return <Loading />;
  
  return <YourComponent />;
}
*/
