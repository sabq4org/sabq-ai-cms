import { NextApiRequest, NextApiResponse } from 'next';
import { externalDataIntegrationService } from '@/lib/modules/external-data-integration/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { start_date, end_date, type = 'integration' } = req.query;

    // Default to last 30 days if no dates provided
    const endDate = end_date ? new Date(end_date as string) : new Date();
    const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date cannot be after end date'
      });
    }

    switch (type) {
      case 'integration':
        const integrationReport = await externalDataIntegrationService.generate_integration_report(startDate, endDate);
        res.status(200).json({
          success: true,
          data: integrationReport,
          type: 'integration_report'
        });
        break;

      case 'health':
        const healthStatus = await externalDataIntegrationService.get_integration_health();
        res.status(200).json({
          success: true,
          data: healthStatus,
          type: 'health_report'
        });
        break;

      case 'sources':
        const dataSources = await externalDataIntegrationService.list_data_sources();
        const sourceReports = await Promise.all(
          dataSources.map(async source => {
            const health = await externalDataIntegrationService.test_data_source_connection(source.id);
            const history = await externalDataIntegrationService.get_sync_history(source.id, 10);
            
            return {
              source,
              health,
              recent_syncs: history.length,
              last_sync: source.last_sync,
              status: source.status
            };
          })
        );

        res.status(200).json({
          success: true,
          data: sourceReports,
          type: 'sources_report',
          total: sourceReports.length
        });
        break;

      default:
        res.status(400).json({
          success: false,
          error: 'Invalid report type. Supported types: integration, health, sources'
        });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
