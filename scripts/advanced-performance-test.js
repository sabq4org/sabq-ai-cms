#!/usr/bin/env node

/**
 * Advanced Performance Testing Script
 * Based on executive optimization guidelines
 */

const fs = require('fs');
const path = require('path');

// Performance test configuration
const CONFIG = {
  testDuration: 60000, // 1 minute
  concurrentUsers: 50,
  rampUpTime: 10000, // 10 seconds
  endpoints: [
    { url: '/api/articles/recent', weight: 40 },
    { url: '/api/articles/featured', weight: 30 },
    { url: '/api/categories', weight: 20 },
    { url: '/api/search', weight: 10 }
  ],
  thresholds: {
    p95ResponseTime: 1500, // 1.5 seconds
    errorRate: 1, // 1%
    throughput: 100 // requests per second
  }
};

class AdvancedPerformanceTester {
  constructor(config = CONFIG) {
    this.config = config;
    this.results = {
      requests: [],
      errors: [],
      startTime: null,
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      throughputData: []
    };
  }

  // Simulate API request
  async simulateRequest(endpoint) {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`http://localhost:3000${endpoint.url}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Performance-Test/1.0',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const result = {
        url: endpoint.url,
        responseTime,
        status: response.status,
        success: response.ok,
        timestamp: Date.now(),
        size: parseInt(response.headers.get('content-length') || '0')
      };
      
      this.results.requests.push(result);
      this.results.responseTimes.push(responseTime);
      
      if (response.ok) {
        this.results.successfulRequests++;
      } else {
        this.results.failedRequests++;
        this.results.errors.push({
          url: endpoint.url,
          status: response.status,
          error: `HTTP ${response.status}`,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.results.failedRequests++;
      this.results.errors.push({
        url: endpoint.url,
        error: error.message,
        timestamp: Date.now()
      });
      
      return {
        url: endpoint.url,
        responseTime,
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Select random endpoint based on weight
  selectEndpoint() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const endpoint of this.config.endpoints) {
      cumulative += endpoint.weight;
      if (random <= cumulative) {
        return endpoint;
      }
    }
    
    return this.config.endpoints[0];
  }

  // Run performance test
  async runTest() {
    console.log('🚀 Starting Advanced Performance Test...');
    console.log(`📊 Configuration:`);
    console.log(`   Duration: ${this.config.testDuration / 1000}s`);
    console.log(`   Concurrent Users: ${this.config.concurrentUsers}`);
    console.log(`   Ramp-up Time: ${this.config.rampUpTime / 1000}s`);
    console.log('');
    
    this.results.startTime = Date.now();
    const endTime = this.results.startTime + this.config.testDuration;
    
    // Create user workers
    const workers = [];
    const rampUpInterval = this.config.rampUpTime / this.config.concurrentUsers;
    
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      setTimeout(() => {
        const worker = this.createWorker(endTime);
        workers.push(worker);
      }, i * rampUpInterval);
    }
    
    // Wait for all workers to complete
    await Promise.all(workers);
    
    this.results.endTime = Date.now();
    this.results.totalRequests = this.results.successfulRequests + this.results.failedRequests;
    
    return this.generateReport();
  }

  // Create a worker that continuously sends requests
  async createWorker(endTime) {
    while (Date.now() < endTime) {
      const endpoint = this.selectEndpoint();
      await this.simulateRequest(endpoint);
      
      // Add some delay between requests (realistic user behavior)
      const delay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Calculate statistics
  calculateStats() {
    if (this.results.responseTimes.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0
      };
    }

    const sorted = [...this.results.responseTimes].sort((a, b) => a - b);
    const length = sorted.length;
    
    return {
      min: sorted[0],
      max: sorted[length - 1],
      avg: sorted.reduce((sum, time) => sum + time, 0) / length,
      p50: sorted[Math.floor(length * 0.5)],
      p90: sorted[Math.floor(length * 0.9)],
      p95: sorted[Math.floor(length * 0.95)],
      p99: sorted[Math.floor(length * 0.99)]
    };
  }

  // Calculate throughput
  calculateThroughput() {
    const duration = (this.results.endTime - this.results.startTime) / 1000; // seconds
    return {
      requestsPerSecond: this.results.totalRequests / duration,
      successfulRequestsPerSecond: this.results.successfulRequests / duration,
      duration
    };
  }

  // Generate comprehensive report
  generateReport() {
    const stats = this.calculateStats();
    const throughput = this.calculateThroughput();
    const errorRate = (this.results.failedRequests / this.results.totalRequests) * 100;
    
    const report = {
      summary: {
        totalRequests: this.results.totalRequests,
        successfulRequests: this.results.successfulRequests,
        failedRequests: this.results.failedRequests,
        errorRate: errorRate.toFixed(2),
        duration: throughput.duration.toFixed(2),
        throughput: throughput.requestsPerSecond.toFixed(2)
      },
      responseTime: {
        min: stats.min.toFixed(2),
        max: stats.max.toFixed(2),
        avg: stats.avg.toFixed(2),
        p50: stats.p50.toFixed(2),
        p90: stats.p90.toFixed(2),
        p95: stats.p95.toFixed(2),
        p99: stats.p99.toFixed(2)
      },
      thresholds: {
        p95Pass: stats.p95 <= this.config.thresholds.p95ResponseTime,
        errorRatePass: errorRate <= this.config.thresholds.errorRate,
        throughputPass: throughput.requestsPerSecond >= this.config.thresholds.throughput
      },
      endpoints: this.analyzeEndpoints(),
      errors: this.categorizeErrors()
    };

    this.printReport(report);
    this.saveReport(report);
    
    return report;
  }

  // Analyze endpoint performance
  analyzeEndpoints() {
    const endpointStats = {};
    
    this.results.requests.forEach(request => {
      if (!endpointStats[request.url]) {
        endpointStats[request.url] = {
          requests: 0,
          responseTimes: [],
          errors: 0
        };
      }
      
      endpointStats[request.url].requests++;
      if (request.responseTime) {
        endpointStats[request.url].responseTimes.push(request.responseTime);
      }
      if (!request.success) {
        endpointStats[request.url].errors++;
      }
    });
    
    return Object.entries(endpointStats).map(([url, data]) => {
      const sorted = data.responseTimes.sort((a, b) => a - b);
      const avg = sorted.reduce((sum, time) => sum + time, 0) / sorted.length || 0;
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
      
      return {
        url,
        requests: data.requests,
        avgResponseTime: avg.toFixed(2),
        p95ResponseTime: p95.toFixed(2),
        errorRate: ((data.errors / data.requests) * 100).toFixed(2)
      };
    });
  }

  // Categorize errors
  categorizeErrors() {
    const errorCategories = {};
    
    this.results.errors.forEach(error => {
      const category = error.status ? `HTTP ${error.status}` : error.error;
      errorCategories[category] = (errorCategories[category] || 0) + 1;
    });
    
    return errorCategories;
  }

  // Print formatted report
  printReport(report) {
    console.log('\n🎯 PERFORMANCE TEST RESULTS');
    console.log('============================');
    
    console.log('\n📈 Summary:');
    console.log(`   Total Requests: ${report.summary.totalRequests}`);
    console.log(`   Successful: ${report.summary.successfulRequests}`);
    console.log(`   Failed: ${report.summary.failedRequests}`);
    console.log(`   Error Rate: ${report.summary.errorRate}%`);
    console.log(`   Duration: ${report.summary.duration}s`);
    console.log(`   Throughput: ${report.summary.throughput} req/s`);
    
    console.log('\n⏱️  Response Times (ms):');
    console.log(`   Average: ${report.responseTime.avg}`);
    console.log(`   P50: ${report.responseTime.p50}`);
    console.log(`   P90: ${report.responseTime.p90}`);
    console.log(`   P95: ${report.responseTime.p95}`);
    console.log(`   P99: ${report.responseTime.p99}`);
    console.log(`   Min: ${report.responseTime.min}`);
    console.log(`   Max: ${report.responseTime.max}`);
    
    console.log('\n✅ Threshold Results:');
    console.log(`   P95 Response Time: ${report.thresholds.p95Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Error Rate: ${report.thresholds.errorRatePass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Throughput: ${report.thresholds.throughputPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (report.endpoints.length > 0) {
      console.log('\n🔗 Endpoint Analysis:');
      report.endpoints.forEach(endpoint => {
        console.log(`   ${endpoint.url}:`);
        console.log(`     Requests: ${endpoint.requests}`);
        console.log(`     Avg Response: ${endpoint.avgResponseTime}ms`);
        console.log(`     P95 Response: ${endpoint.p95ResponseTime}ms`);
        console.log(`     Error Rate: ${endpoint.errorRate}%`);
      });
    }
    
    if (Object.keys(report.errors).length > 0) {
      console.log('\n❌ Error Analysis:');
      Object.entries(report.errors).forEach(([error, count]) => {
        console.log(`   ${error}: ${count} occurrences`);
      });
    }
  }

  // Save report to file
  saveReport(report) {
    const filename = `performance-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(process.cwd(), 'performance-reports', filename);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify({
      ...report,
      raw: this.results,
      config: this.config
    }, null, 2));
    
    console.log(`\n💾 Report saved to: ${filepath}`);
  }
}

// CLI execution
if (require.main === module) {
  const tester = new AdvancedPerformanceTester();
  
  tester.runTest().then(report => {
    const allPassed = Object.values(report.thresholds).every(Boolean);
    process.exit(allPassed ? 0 : 1);
  }).catch(error => {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  });
}

module.exports = AdvancedPerformanceTester;
