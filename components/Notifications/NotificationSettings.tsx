'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Snackbar,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete
} from '@mui/material';
import {
  Notifications,
  Email,
  Sms,
  PhoneAndroid,
  Language,
  AccessTime,
  Block,
  Add,
  Delete,
  Edit
} from '@mui/icons-material';

interface NotificationPreferences {
  enabled: boolean;
  frequency: 'high' | 'medium' | 'low';
  maxDaily: number;
  enabledTypes: string[];
  enabledChannels: string[];
  grouping: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: Array<{ start: number; end: number }>;
  preferredHours: number[];
  weekendPreferences: boolean;
}

const notificationTypes = [
  { value: 'SOCIAL_INTERACTION', label: 'التفاعلات الاجتماعية', icon: '👥' },
  { value: 'CONTENT_RECOMMENDATION', label: 'توصيات المحتوى', icon: '📚' },
  { value: 'AUTHOR_UPDATE', label: 'تحديثات الكُتّاب', icon: '✍️' },
  { value: 'SIMILAR_CONTENT', label: 'محتوى مشابه', icon: '🔗' },
  { value: 'BREAKING_NEWS', label: 'الأخبار العاجلة', icon: '⚡' },
  { value: 'SYSTEM_ANNOUNCEMENT', label: 'إعلانات النظام', icon: '📢' },
  { value: 'REMINDER', label: 'التذكيرات', icon: '⏰' },
  { value: 'ACHIEVEMENT', label: 'الإنجازات', icon: '🏆' }
];

const deliveryChannels = [
  { value: 'WEB_PUSH', label: 'إشعارات المتصفح', icon: <Language /> },
  { value: 'MOBILE_PUSH', label: 'إشعارات الهاتف', icon: <PhoneAndroid /> },
  { value: 'EMAIL', label: 'البريد الإلكتروني', icon: <Email /> },
  { value: 'SMS', label: 'الرسائل النصية', icon: <Sms /> },
  { value: 'IN_APP', label: 'داخل التطبيق', icon: <Notifications /> }
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    frequency: 'medium',
    maxDaily: 10,
    enabledTypes: ['BREAKING_NEWS', 'CONTENT_RECOMMENDATION'],
    enabledChannels: ['WEB_PUSH', 'IN_APP'],
    grouping: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: [{ start: 22, end: 6 }],
    preferredHours: [9, 13, 19],
    weekendPreferences: true
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // جلب الإعدادات الحالية
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      // في تطبيق حقيقي، سنجلب من API
      // const response = await fetch('/api/notifications/preferences');
      // const data = await response.json();
      // setPreferences(data);
    } catch (error) {
      setError('فشل جلب الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // في تطبيق حقيقي، سنرسل إلى API
      // await fetch('/api/notifications/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences)
      // });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      enabledTypes: prev.enabledTypes.includes(type)
        ? prev.enabledTypes.filter(t => t !== type)
        : [...prev.enabledTypes, type]
    }));
  };

  const handleChannelToggle = (channel: string) => {
    setPreferences(prev => ({
      ...prev,
      enabledChannels: prev.enabledChannels.includes(channel)
        ? prev.enabledChannels.filter(c => c !== channel)
        : [...prev.enabledChannels, channel]
    }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        إعدادات الإشعارات الذكية
      </Typography>

      <Grid container spacing={3}>
        {/* الإعدادات العامة */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الإعدادات العامة
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.enabled}
                      onChange={(e) => setPreferences({ ...preferences, enabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="تفعيل الإشعارات"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.grouping}
                      onChange={(e) => setPreferences({ ...preferences, grouping: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="تجميع الإشعارات المتشابهة"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.soundEnabled}
                      onChange={(e) => setPreferences({ ...preferences, soundEnabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="تفعيل الصوت"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.vibrationEnabled}
                      onChange={(e) => setPreferences({ ...preferences, vibrationEnabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="تفعيل الاهتزاز"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.weekendPreferences}
                      onChange={(e) => setPreferences({ ...preferences, weekendPreferences: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="إعدادات خاصة لنهاية الأسبوع"
                />
              </FormGroup>

              <Divider sx={{ my: 3 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>معدل الإشعارات</InputLabel>
                <Select
                  value={preferences.frequency}
                  onChange={(e) => setPreferences({ ...preferences, frequency: e.target.value as any })}
                  label="معدل الإشعارات"
                >
                  <MenuItem value="high">عالي - جميع التحديثات</MenuItem>
                  <MenuItem value="medium">متوسط - التحديثات المهمة</MenuItem>
                  <MenuItem value="low">منخفض - الضروري فقط</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  الحد الأقصى اليومي: {preferences.maxDaily} إشعار
                </Typography>
                <Slider
                  value={preferences.maxDaily}
                  onChange={(e, value) => setPreferences({ ...preferences, maxDaily: value as number })}
                  min={1}
                  max={50}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* أنواع الإشعارات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                أنواع الإشعارات
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {notificationTypes.map(type => (
                  <Chip
                    key={type.value}
                    label={`${type.icon} ${type.label}`}
                    onClick={() => handleTypeToggle(type.value)}
                    color={preferences.enabledTypes.includes(type.value) ? 'primary' : 'default'}
                    variant={preferences.enabledTypes.includes(type.value) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                قنوات التوصيل
              </Typography>
              
              <List>
                {deliveryChannels.map(channel => (
                  <ListItem key={channel.value} disablePadding>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.enabledChannels.includes(channel.value)}
                          onChange={() => handleChannelToggle(channel.value)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {channel.icon}
                          <Typography>{channel.label}</Typography>
                        </Box>
                      }
                      sx={{ width: '100%', ml: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* أزرار الحفظ */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={fetchPreferences}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          حفظ الإعدادات
        </Button>
      </Box>

      {/* Snackbars */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          تم حفظ الإعدادات بنجاح
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}