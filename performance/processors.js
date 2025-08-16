/**
 * Artillery.js Custom Processors for Sabq AI CMS Load Testing
 */

const fs = require('fs');
const path = require('path');

// Sample article IDs for testing
const sampleArticleIds = [
  'tech-article-1',
  'sports-article-1',
  'news-article-1',
  'economy-article-1',
  'health-article-1',
];

// Sample user agents for realistic testing
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
];

// Performance metrics collection
let performanceMetrics = {
  responseTimeP95: [],
  responseTimeP99: [],
  errorRates: [],
  throughput: [],
  concurrentUsers: 0,
  totalRequests: 0,
  totalErrors: 0,
  startTime: Date.now(),
};

/**
 * Generate random search query from predefined list
 */
function generateSearchQuery(requestParams, context, ee, next) {
  const queries = context.vars.searchQueries;
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  context.vars.searchQuery = randomQuery;
  return next();
}

/**
 * Generate random article ID for testing
 */
function generateArticleId(requestParams, context, ee, next) {
  const randomId = sampleArticleIds[Math.floor(Math.random() * sampleArticleIds.length)];
  context.vars.articleId = randomId;
  return next();
}

/**
 * Generate random user agent
 */
function setRandomUserAgent(requestParams, context, ee, next) {
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  requestParams.headers = requestParams.headers || {};
  requestParams.headers['User-Agent'] = randomUserAgent;
  return next();
}

/**
 * Generate timestamp for analytics
 */
function generateTimestamp(requestParams, context, ee, next) {
  context.vars.timestamp = new Date().toISOString();
  return next();
}

/**
 * Simulate user reading behavior
 */
function simulateReadingTime(requestParams, context, ee, next) {
  // Random reading time between 5-30 seconds
  const readingTime = Math.floor(Math.random() * 25000) + 5000;
  context.vars.readingTime = readingTime;
  
  setTimeout(() => {
    return next();
  }, Math.min(readingTime, 3000)); // Cap at 3 seconds for load testing
}

/**
 * Track response times
 */
function trackResponseTime(requestParams, response, context, ee, next) {
  const responseTime = response.timings?.phases?.total || 0;
  
  performanceMetrics.totalRequests++;
  performanceMetrics.responseTimeP95.push(responseTime);
  performanceMetrics.responseTimeP99.push(responseTime);
  
  if (response.statusCode >= 400) {
    performanceMetrics.totalErrors++;
  }
  
  // Emit custom metrics
  ee.emit('customStat', {
    stat: 'response_time',
    value: responseTime,
  });
  
  return next();
}

/**
 * Log slow responses
 */
function logSlowResponses(requestParams, response, context, ee, next) {
  const responseTime = response.timings?.phases?.total || 0;
  const threshold = 2000; // 2 seconds
  
  if (responseTime > threshold) {
    console.log(`🐌 Slow response detected: ${responseTime}ms for ${requestParams.url}`);
    
    // Log to file for analysis
    const logEntry = {
      timestamp: new Date().toISOString(),
      url: requestParams.url,
      method: requestParams.method || 'GET',
      responseTime,
      statusCode: response.statusCode,
      userAgent: requestParams.headers?.['User-Agent'] || 'Unknown',
    };
    
    logSlowRequest(logEntry);
  }
  
  return next();
}

/**
 * Monitor memory usage during tests
 */
function monitorMemory(requestParams, response, context, ee, next) {
  const memUsage = process.memoryUsage();
  
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
    console.log(`⚠️ High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
  
  ee.emit('customStat', {
    stat: 'memory_usage',
    value: memUsage.heapUsed,
  });
  
  return next();
}

/**
 * Simulate realistic user behavior patterns
 */
function simulateUserBehavior(requestParams, context, ee, next) {
  const behaviors = [
    'quick_browse',    // Quick browsing, short stays
    'deep_reader',     // Long reading sessions
    'social_user',     // Lots of interactions
    'search_focused',  // Search-heavy behavior
  ];
  
  const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
  context.vars.userBehavior = behavior;
  
  // Adjust think times based on behavior
  switch (behavior) {
    case 'quick_browse':
      context.vars.thinkTime = Math.random() * 1000; // 0-1 second
      break;
    case 'deep_reader':
      context.vars.thinkTime = Math.random() * 10000 + 5000; // 5-15 seconds
      break;
    case 'social_user':
      context.vars.thinkTime = Math.random() * 2000 + 1000; // 1-3 seconds
      break;
    case 'search_focused':
      context.vars.thinkTime = Math.random() * 3000 + 2000; // 2-5 seconds
      break;
  }
  
  return next();
}

/**
 * Generate realistic interaction patterns
 */
function generateInteractions(requestParams, context, ee, next) {
  const interactionTypes = ['like', 'save', 'share', 'comment'];
  const randomInteraction = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
  context.vars.interactionType = randomInteraction;
  
  // Some users are more likely to interact
  context.vars.interactionProbability = Math.random();
  
  return next();
}

/**
 * Validate API responses
 */
function validateApiResponse(requestParams, response, context, ee, next) {
  try {
    if (response.headers['content-type']?.includes('application/json')) {
      const data = JSON.parse(response.body);
      
      // Check for required fields based on endpoint
      if (requestParams.url.includes('/api/recommendations')) {
        if (!data.recommendations || !Array.isArray(data.recommendations)) {
          ee.emit('customStat', {
            stat: 'api_validation_error',
            value: 1,
          });
          console.log(`❌ Invalid recommendations API response: ${requestParams.url}`);
        }
      }
      
      if (requestParams.url.includes('/api/search')) {
        if (!data.results || !Array.isArray(data.results)) {
          ee.emit('customStat', {
            stat: 'api_validation_error',
            value: 1,
          });
          console.log(`❌ Invalid search API response: ${requestParams.url}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ JSON parsing error for ${requestParams.url}:`, error.message);
  }
  
  return next();
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
  const duration = (Date.now() - performanceMetrics.startTime) / 1000;
  const throughput = performanceMetrics.totalRequests / duration;
  const errorRate = (performanceMetrics.totalErrors / performanceMetrics.totalRequests) * 100;
  
  // Calculate percentiles
  performanceMetrics.responseTimeP95.sort((a, b) => a - b);
  performanceMetrics.responseTimeP99.sort((a, b) => a - b);
  
  const p95Index = Math.floor(performanceMetrics.responseTimeP95.length * 0.95);
  const p99Index = Math.floor(performanceMetrics.responseTimeP99.length * 0.99);
  
  const p95ResponseTime = performanceMetrics.responseTimeP95[p95Index] || 0;
  const p99ResponseTime = performanceMetrics.responseTimeP99[p99Index] || 0;
  
  const report = {
    summary: {
      duration: `${duration.toFixed(2)}s`,
      totalRequests: performanceMetrics.totalRequests,
      totalErrors: performanceMetrics.totalErrors,
      errorRate: `${errorRate.toFixed(2)}%`,
      throughput: `${throughput.toFixed(2)} req/s`,
    },
    responseTime: {
      p95: `${p95ResponseTime.toFixed(2)}ms`,
      p99: `${p99ResponseTime.toFixed(2)}ms`,
    },
    thresholds: {
      p95Threshold: '200ms',
      p95Pass: p95ResponseTime <= 200,
      errorRateThreshold: '1%',
      errorRatePass: errorRate <= 1,
      throughputThreshold: '10 req/s',
      throughputPass: throughput >= 10,
    },
    timestamp: new Date().toISOString(),
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, '../test-results/performance-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Performance Test Report:');
  console.log(`⏱️  Duration: ${report.summary.duration}`);
  console.log(`📈 Throughput: ${report.summary.throughput}`);
  console.log(`❌ Error Rate: ${report.summary.errorRate}`);
  console.log(`⚡ P95 Response Time: ${report.responseTime.p95}`);
  console.log(`🔥 P99 Response Time: ${report.responseTime.p99}`);
  
  // Check thresholds
  console.log('\n🎯 Threshold Checks:');
  console.log(`P95 < 200ms: ${report.thresholds.p95Pass ? '✅' : '❌'}`);
  console.log(`Error Rate < 1%: ${report.thresholds.errorRatePass ? '✅' : '❌'}`);
  console.log(`Throughput > 10 req/s: ${report.thresholds.throughputPass ? '✅' : '❌'}`);
  
  return report;
}

/**
 * Log slow requests to file
 */
function logSlowRequest(logEntry) {
  const logPath = path.join(__dirname, '../test-results/slow-requests.log');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  
  const logLine = `${logEntry.timestamp} | ${logEntry.method} ${logEntry.url} | ${logEntry.responseTime}ms | ${logEntry.statusCode} | ${logEntry.userAgent}\n`;
  fs.appendFileSync(logPath, logLine);
}

/**
 * Cleanup function called at test end
 */
function cleanup(context, ee, next) {
  console.log('\n🧹 Cleaning up performance test...');
  generatePerformanceReport();
  return next();
}

module.exports = {
  generateSearchQuery,
  generateArticleId,
  setRandomUserAgent,
  generateTimestamp,
  simulateReadingTime,
  trackResponseTime,
  logSlowResponses,
  monitorMemory,
  simulateUserBehavior,
  generateInteractions,
  validateApiResponse,
  cleanup,
};
