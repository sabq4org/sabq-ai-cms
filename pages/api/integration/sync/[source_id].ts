import { NextApiRequest, NextApiResponse } from 'next';
import { externalDataIntegrationService } from '@/lib/modules/external-data-integration/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { source_id } = req.query;

  if (!source_id || typeof source_id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid source_id parameter'
    });
  }

  try {
    switch (req.method) {
      case 'POST':
        // Start sync
        const { force = false, dry_run = false, batch_size, timeout_ms } = req.body;
        
        const syncResult = await externalDataIntegrationService.sync_data_source(source_id, {
          force,
          dry_run,
          batch_size,
          timeout_ms
        });

        res.status(200).json({
          success: true,
          data: syncResult,
          message: dry_run ? 'Dry run completed' : 'Sync started successfully'
        });
        break;

      case 'GET':
        // Get sync history
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const history = await externalDataIntegrationService.get_sync_history(source_id, limit);

        res.status(200).json({
          success: true,
          data: history,
          total: history.length,
          source_id
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process sync request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
