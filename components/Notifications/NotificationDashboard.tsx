'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  CheckCircle,
  Cancel,
  AccessTime,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

// واجهة لوحة تحكم الإشعارات
interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  byChannel: Record<string, number>;
  byType: Record<string, number>;
  hourlyDistribution: number[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NotificationDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // جلب الإحصائيات
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/stats/current-user');
      if (!response.ok) throw new Error('فشل جلب الإحصائيات');
      
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      setError('حدث خطأ في جلب الإحصائيات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // بيانات الرسوم البيانية
  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'الإشعارات المرسلة',
        data: stats?.hourlyDistribution || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  const channelChartData = {
    labels: Object.keys(stats?.byChannel || {}),
    datasets: [
      {
        label: 'حسب القناة',
        data: Object.values(stats?.byChannel || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const typeChartData = {
    labels: Object.keys(stats?.byType || {}),
    datasets: [
      {
        label: 'حسب النوع',
        data: Object.values(stats?.byType || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          لوحة تحكم الإشعارات الذكية
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مراقبة وتحليل أداء نظام الإشعارات في الوقت الفعلي
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalSent || 0}
                  </Typography>
                  <Typography variant="body2">
                    إجمالي المرسل
                  </Typography>
                </Box>
                <SendIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.deliveryRate ? `${(stats.deliveryRate * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                  <Typography variant="body2">
                    معدل التسليم
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.openRate ? `${(stats.openRate * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                  <Typography variant="body2">
                    معدل الفتح
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.clickRate ? `${(stats.clickRate * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                  <Typography variant="body2">
                    معدل النقر
                  </Typography>
                </Box>
                <AnalyticsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification dashboard tabs">
            <Tab icon={<DashboardIcon />} label="نظرة عامة" />
            <Tab icon={<AnalyticsIcon />} label="التحليلات" />
            <Tab icon={<NotificationsIcon />} label="الإشعارات الأخيرة" />
            <Tab icon={<SettingsIcon />} label="الإعدادات" />
          </Tabs>
        </Box>

        {/* نظرة عامة */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    توزيع الإشعارات على مدار اليوم
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={hourlyChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    توزيع القنوات
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut
                      data={channelChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* التحليلات */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    توزيع أنواع الإشعارات
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <Bar
                      data={typeChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* الإشعارات الأخيرة */}
        <TabPanel value={tabValue} index={2}>
          <RecentNotifications />
        </TabPanel>

        {/* الإعدادات */}
        <TabPanel value={tabValue} index={3}>
          <NotificationSettings />
        </TabPanel>
      </Paper>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// مكون الإشعارات الأخيرة
function RecentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/user/current-user?limit=10');
      const data = await response.json();
      setNotifications(data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon: React.ReactElement }> = {
      SENT: { color: 'primary', icon: <SendIcon fontSize="small" /> },
      DELIVERED: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      READ: { color: 'info', icon: <CheckCircle fontSize="small" /> },
      CLICKED: { color: 'warning', icon: <CheckCircle fontSize="small" /> },
      FAILED: { color: 'error', icon: <Cancel fontSize="small" /> },
      SCHEDULED: { color: 'default', icon: <AccessTime fontSize="small" /> }
    };

    const config = statusConfig[status] || { color: 'default', icon: null };

    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  if (loading) return <LinearProgress />;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>النوع</TableCell>
            <TableCell>العنوان</TableCell>
            <TableCell>القناة</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>التاريخ</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notifications.map((notification: any) => (
            <TableRow key={notification.id}>
              <TableCell>
                <Chip label={notification.type} size="small" />
              </TableCell>
              <TableCell>{notification.title}</TableCell>
              <TableCell>
                {notification.channels.map((channel: string) => (
                  <Chip key={channel} label={channel} size="small" sx={{ mr: 0.5 }} />
                ))}
              </TableCell>
              <TableCell>{getStatusChip(notification.status)}</TableCell>
              <TableCell>
                {new Date(notification.createdAt).toLocaleString('ar-SA')}
              </TableCell>
              <TableCell>
                <Tooltip title="عرض التفاصيل">
                  <IconButton size="small">
                    <AnalyticsIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// مكون إعدادات الإشعارات
function NotificationSettings() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        إعدادات الإشعارات
      </Typography>
      <Alert severity="info" sx={{ mt: 2 }}>
        يمكنك تخصيص إعدادات الإشعارات من صفحة الإعدادات الشخصية
      </Alert>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" href="/settings/notifications">
          الذهاب إلى الإعدادات
        </Button>
      </Box>
    </Box>
  );
}
