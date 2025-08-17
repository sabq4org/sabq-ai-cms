import { NextApiRequest, NextApiResponse } from 'next';
import { externalDataIntegrationService } from '@/lib/modules/external-data-integration/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sync_id } = req.query;

  if (!sync_id || typeof sync_id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid sync_id parameter'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get sync status
        const syncStatus = await externalDataIntegrationService.get_sync_status(sync_id);
        
        if (!syncStatus) {
          return res.status(404).json({
            success: false,
            error: 'Sync not found'
          });
        }

        res.status(200).json({
          success: true,
          data: syncStatus
        });
        break;

      case 'DELETE':
        // Cancel sync
        const cancelled = await externalDataIntegrationService.cancel_sync(sync_id);
        
        if (!cancelled) {
          return res.status(404).json({
            success: false,
            error: 'Sync not found or already completed'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Sync cancelled successfully'
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Sync status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process sync status request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
