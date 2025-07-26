import { NextApiRequest, NextApiResponse } from 'next';
import { externalDataIntegrationService } from '@/lib/modules/external-data-integration/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const sources = await externalDataIntegrationService.list_data_sources();
        res.status(200).json({
          success: true,
          data: sources,
          total: sources.length,
          timestamp: new Date().toISOString()
        });
        break;

      case 'POST':
        const { name, type, provider, description, configuration, authentication, sync_settings } = req.body;
        
        if (!name || !type || !provider || !configuration) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, type, provider, configuration'
          });
        }

        const newDataSource = await externalDataIntegrationService.create_data_source({
          name,
          type,
          provider,
          description: description || '',
          configuration,
          authentication: authentication || { type: 'none' },
          sync_settings: sync_settings || {
            frequency: 'daily',
            mode: 'incremental',
            batch_size: 1000,
            timeout_ms: 30000,
            retry_attempts: 3
          },
          status: 'active',
          last_sync: null
        });

        res.status(201).json({
          success: true,
          data: newDataSource,
          message: 'Data source created successfully'
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Data sources API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
