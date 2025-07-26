import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock real-time analytics data
    const realTimeData = {
      current_visitors: Math.floor(Math.random() * 500) + 100,
      active_sessions: Math.floor(Math.random() * 300) + 50,
      page_views_last_hour: Math.floor(Math.random() * 2000) + 500,
      top_pages: [
        { path: '/', visitors: Math.floor(Math.random() * 100) + 50 },
        { path: '/articles', visitors: Math.floor(Math.random() * 80) + 30 },
        { path: '/categories', visitors: Math.floor(Math.random() * 60) + 20 },
      ],
      traffic_sources: {
        direct: Math.floor(Math.random() * 40) + 20,
        search: Math.floor(Math.random() * 30) + 15,
        social: Math.floor(Math.random() * 20) + 10,
        referral: Math.floor(Math.random() * 15) + 5
      },
      performance_metrics: {
        avg_load_time: (Math.random() * 2 + 1).toFixed(2) + 's',
        bounce_rate: (Math.random() * 30 + 20).toFixed(1) + '%',
        conversion_rate: (Math.random() * 5 + 2).toFixed(2) + '%'
      },
      anomalies: Math.random() > 0.8 ? [
        {
          type: 'spike',
          metric: 'page_views',
          severity: 'medium',
          description: 'زيادة غير اعتيادية في مشاهدات الصفحات',
          timestamp: new Date()
        }
      ] : [],
      last_updated: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: realTimeData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
