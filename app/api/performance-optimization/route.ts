/**
 * نظام تحسين الأداء - API Endpoints
 * Performance Optimization API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceOptimizationService } from '../../../lib/modules/performance-optimization/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'current_performance';

    switch (action) {
      case 'current_performance':
        const snapshot = await performanceOptimizationService.get_current_performance();
        return NextResponse.json({ success: true, data: snapshot });

      case 'history':
        const startDate = searchParams.get('start_date') 
          ? new Date(searchParams.get('start_date')!) 
          : new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
        const endDate = searchParams.get('end_date') 
          ? new Date(searchParams.get('end_date')!) 
          : new Date();
        
        const history = await performanceOptimizationService.get_performance_history(startDate, endDate);
        return NextResponse.json({ success: true, data: history });

      case 'rules':
        const rules = await performanceOptimizationService.get_optimization_rules();
        return NextResponse.json({ success: true, data: rules });

      case 'results':
        const results = await performanceOptimizationService.get_optimization_results();
        return NextResponse.json({ success: true, data: results });

      case 'recommendations':
        const recommendations = await performanceOptimizationService.get_optimization_recommendations();
        return NextResponse.json({ success: true, data: recommendations });

      case 'alerts':
        const alerts = await performanceOptimizationService.get_active_alerts();
        return NextResponse.json({ success: true, data: alerts });

      case 'cache_performance':
        const cacheStats = await performanceOptimizationService.get_cache_performance();
        return NextResponse.json({ success: true, data: cacheStats });

      case 'database_performance':
        const dbMetrics = await performanceOptimizationService.get_database_performance();
        return NextResponse.json({ success: true, data: dbMetrics });

      case 'image_stats':
        const imageStats = await performanceOptimizationService.get_image_optimization_stats();
        return NextResponse.json({ success: true, data: imageStats });

      case 'config':
        const config = await performanceOptimizationService.get_optimization_config();
        return NextResponse.json({ success: true, data: config });

      case 'export':
        const format = searchParams.get('format') as 'json' | 'csv' | 'excel' || 'json';
        const exportData = await performanceOptimizationService.export_performance_data(format);
        
        if (format === 'json') {
          return new NextResponse(exportData, {
            headers: {
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="performance-data-${Date.now()}.json"`
            }
          });
        } else {
          return NextResponse.json({ success: true, message: `${format} export not implemented yet` });
        }

      case 'report':
        const reportStart = searchParams.get('start_date') 
          ? new Date(searchParams.get('start_date')!) 
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        const reportEnd = searchParams.get('end_date') 
          ? new Date(searchParams.get('end_date')!) 
          : new Date();
        
        const report = await performanceOptimizationService.generate_performance_report(reportStart, reportEnd);
        return NextResponse.json({ success: true, data: report });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance optimization API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start_monitoring':
        await performanceOptimizationService.start_performance_monitoring();
        return NextResponse.json({ success: true, message: 'Performance monitoring started' });

      case 'stop_monitoring':
        await performanceOptimizationService.stop_performance_monitoring();
        return NextResponse.json({ success: true, message: 'Performance monitoring stopped' });

      case 'create_rule':
        const { rule } = body;
        const newRule = await performanceOptimizationService.create_optimization_rule(rule);
        return NextResponse.json({ success: true, data: newRule });

      case 'execute_optimization':
        const { rule_id } = body;
        const result = await performanceOptimizationService.execute_optimization(rule_id);
        return NextResponse.json({ success: true, data: result });

      case 'implement_recommendation':
        const { recommendation_id } = body;
        const recResult = await performanceOptimizationService.implement_recommendation(recommendation_id);
        return NextResponse.json({ success: true, data: recResult });

      case 'rollback_optimization':
        const { result_id } = body;
        const rollbackSuccess = await performanceOptimizationService.rollback_optimization(result_id);
        return NextResponse.json({ success: rollbackSuccess, message: rollbackSuccess ? 'Rollback successful' : 'Rollback failed' });

      case 'acknowledge_alert':
        const { alert_id } = body;
        await performanceOptimizationService.acknowledge_alert(alert_id);
        return NextResponse.json({ success: true, message: 'Alert acknowledged' });

      case 'resolve_alert':
        const { alert_id: resolveAlertId, notes } = body;
        await performanceOptimizationService.resolve_alert(resolveAlertId, notes);
        return NextResponse.json({ success: true, message: 'Alert resolved' });

      case 'configure_caching':
        const { cache_config } = body;
        await performanceOptimizationService.configure_caching(cache_config);
        return NextResponse.json({ success: true, message: 'Caching configured' });

      case 'invalidate_cache':
        const { pattern } = body;
        await performanceOptimizationService.invalidate_cache(pattern);
        return NextResponse.json({ success: true, message: 'Cache invalidated' });

      case 'optimize_database':
        const dbOptResult = await performanceOptimizationService.optimize_database();
        return NextResponse.json({ success: true, data: dbOptResult });

      case 'optimize_images':
        const { paths } = body;
        const imgOptResult = await performanceOptimizationService.optimize_images(paths || []);
        return NextResponse.json({ success: true, data: imgOptResult });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance optimization API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_rule':
        const { rule_id, updates } = body;
        const updatedRule = await performanceOptimizationService.update_optimization_rule(rule_id, updates);
        return NextResponse.json({ success: true, data: updatedRule });

      case 'update_config':
        const { config } = body;
        const updatedConfig = await performanceOptimizationService.update_optimization_config(config);
        return NextResponse.json({ success: true, data: updatedConfig });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance optimization API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'delete_rule':
        const deleted = await performanceOptimizationService.delete_optimization_rule(id);
        return NextResponse.json({ success: deleted, message: deleted ? 'Rule deleted' : 'Rule not found' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance optimization API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
