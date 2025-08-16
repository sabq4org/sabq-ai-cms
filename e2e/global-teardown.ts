import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E Test Cleanup...');

  try {
    // Clean up test data
    console.log('🗑️ Cleaning up test data...');
    
    // Remove test data file
    const testDataPath = path.join(__dirname, 'test-data.json');
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
      console.log('✅ Test data file cleaned up');
    }

    // Clean up test artifacts
    const testResultsPath = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(testResultsPath)) {
      // Only clean up old test results, keep the latest ones
      const files = fs.readdirSync(testResultsPath);
      const oldFiles = files.filter(file => {
        const filePath = path.join(testResultsPath, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays > 7; // Keep files for 7 days
      });

      oldFiles.forEach(file => {
        const filePath = path.join(testResultsPath, file);
        try {
          if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true });
          } else {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.warn(`⚠️ Could not delete ${filePath}:`, error);
        }
      });

      if (oldFiles.length > 0) {
        console.log(`✅ Cleaned up ${oldFiles.length} old test result files`);
      }
    }

    // Generate test summary report
    console.log('📊 Generating test summary...');
    
    const summaryPath = path.join(process.cwd(), 'test-results', 'summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      totalProjects: config.projects.length,
      testDirectory: config.testDir,
      outputDirectory: config.outputDir,
      cleanup: {
        completed: true,
        cleanedFiles: oldFiles?.length || 0,
      },
    };

    if (!fs.existsSync(path.dirname(summaryPath))) {
      fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    }
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('✅ E2E Test Cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ E2E Test Cleanup failed:', error);
    // Don't throw - cleanup failures shouldn't fail the test suite
  }
}

export default globalTeardown;
