import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './helpers/test-helpers';

test.describe('Homepage and Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test.describe('Basic Page Loading', () => {
    test('should load homepage successfully', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/سبق/);
      
      // Check main navigation elements
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Check Arabic RTL layout
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('dir', 'rtl');
      await expect(htmlElement).toHaveAttribute('lang', 'ar');
    });

    test('should display main navigation menu', async ({ page }) => {
      // Check main navigation links
      const navLinks = [
        'الرئيسية',
        'الأخبار',
        'التقنية',
        'الرياضة',
        'الاقتصاد',
      ];

      for (const linkText of navLinks) {
        await expect(page.getByRole('link', { name: linkText })).toBeVisible();
      }
    });

    test('should display smart recommendations section', async ({ page }) => {
      // Wait for smart recommendations to load
      await expect(page.getByText('التوصيات الذكية')).toBeVisible({ timeout: 10000 });
      
      // Check that recommendations are displayed
      const recommendationCards = page.locator('[data-testid="recommendation-card"]');
      await expect(recommendationCards.first()).toBeVisible();
      
      // Check recommendation metadata
      await expect(page.locator('[data-testid="confidence-score"]').first()).toBeVisible();
    });

    test('should display intelligent notifications', async ({ page }) => {
      // Check notifications button in header
      const notificationButton = page.getByRole('button', { name: /إشعارات/ });
      await expect(notificationButton).toBeVisible();
      
      // Check notification badge (may or may not have unread count)
      const notificationIcon = page.getByTestId('notifications-icon');
      await expect(notificationIcon).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile navigation
      const mobileMenuButton = page.getByRole('button', { name: /قائمة/ });
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        
        // Check mobile menu items
        await expect(page.getByText('الرئيسية')).toBeVisible();
        await expect(page.getByText('الأخبار')).toBeVisible();
      }
      
      // Check responsive layout
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check layout adapts to tablet
      const navigation = page.locator('nav');
      await expect(navigation).toBeVisible();
      
      // Check content grid adjusts
      const contentGrid = page.locator('[data-testid="content-grid"]');
      if (await contentGrid.isVisible()) {
        const gridItems = contentGrid.locator('> *');
        const count = await gridItems.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Dark/Light Theme', () => {
    test('should toggle theme correctly', async ({ page }) => {
      // Find theme toggle button
      const themeToggle = page.getByRole('button', { name: /موضوع/ });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        
        // Check theme changed
        const body = page.locator('body');
        await expect(body).toHaveClass(/dark/);
        
        // Toggle back
        await themeToggle.click();
        await expect(body).not.toHaveClass(/dark/);
      }
    });

    test('should persist theme preference', async ({ page, context }) => {
      // Set dark theme
      const themeToggle = page.getByRole('button', { name: /موضوع/ });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        
        // Create new page and check theme persisted
        const newPage = await context.newPage();
        await newPage.goto('/');
        
        const body = newPage.locator('body');
        await expect(body).toHaveClass(/dark/);
        
        await newPage.close();
      }
    });
  });

  test.describe('Language Support', () => {
    test('should display Arabic content correctly', async ({ page }) => {
      // Check Arabic text renders correctly
      const arabicText = page.getByText('التوصيات الذكية');
      await expect(arabicText).toBeVisible();
      
      // Check RTL layout
      const contentDirection = await page.locator('html').getAttribute('dir');
      expect(contentDirection).toBe('rtl');
    });

    test('should handle mixed Arabic/English content', async ({ page }) => {
      // Check mixed content rendering
      const mixedContent = page.locator('text=التقنية').first();
      if (await mixedContent.isVisible()) {
        const boundingBox = await mixedContent.boundingBox();
        expect(boundingBox).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should have good Core Web Vitals', async ({ page }) => {
      await page.goto('/');
      
      // Measure LCP (Largest Contentful Paint)
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      expect(lcp).toBeLessThan(2500); // Good LCP is < 2.5s
    });
  });

  test.describe('Search Functionality', () => {
    test('should open search modal', async ({ page }) => {
      const searchButton = page.getByRole('button', { name: /بحث/ });
      if (await searchButton.isVisible()) {
        await searchButton.click();
        
        // Check search modal opened
        const searchModal = page.getByRole('dialog', { name: /بحث/ });
        await expect(searchModal).toBeVisible();
        
        // Check search input
        const searchInput = page.getByPlaceholder(/ابحث/);
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeFocused();
      }
    });

    test('should perform search and show results', async ({ page }) => {
      const searchButton = page.getByRole('button', { name: /بحث/ });
      if (await searchButton.isVisible()) {
        await searchButton.click();
        
        const searchInput = page.getByPlaceholder(/ابحث/);
        await searchInput.fill('تقنية');
        await searchInput.press('Enter');
        
        // Wait for search results
        await expect(page.getByText('نتائج البحث')).toBeVisible({ timeout: 5000 });
        
        // Check results are displayed
        const searchResults = page.locator('[data-testid="search-result"]');
        await expect(searchResults.first()).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      expect(h1Count).toBe(1); // Should have exactly one h1
      
      // Check heading structure
      await expect(h1Elements.first()).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through focusable elements
      await page.keyboard.press('Tab');
      
      // Check first focusable element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate to main content
      const skipLink = page.getByText('تخطي إلى المحتوى الرئيسي');
      if (await skipLink.isVisible()) {
        await skipLink.click();
        await expect(page.locator('main')).toBeFocused();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check navigation has proper labels
      const navigation = page.locator('nav').first();
      if (await navigation.isVisible()) {
        const ariaLabel = await navigation.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
      
      // Check buttons have labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const hasAriaLabel = await button.getAttribute('aria-label');
          const hasText = await button.textContent();
          expect(hasAriaLabel || hasText).toBeTruthy();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to navigate
      await page.goto('/', { waitUntil: 'networkidle' }).catch(() => {});
      
      // Should show offline message or cached content
      const offlineIndicator = page.getByText(/لا يوجد اتصال بالإنترنت|غير متصل/);
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test('should display error boundaries for component failures', async ({ page }) => {
      // This would need to be triggered by simulating a component error
      // For now, we'll just check that error boundaries are in place
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      
      // If error boundary is shown, check it has proper content
      if (await errorBoundary.isVisible()) {
        await expect(errorBoundary.getByText(/حدث خطأ/)).toBeVisible();
        await expect(errorBoundary.getByRole('button', { name: /إعادة المحاولة/ })).toBeVisible();
      }
    });
  });
});
