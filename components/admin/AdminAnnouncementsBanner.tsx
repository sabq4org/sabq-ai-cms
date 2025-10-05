'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * شريط البانر للإعلانات العاجلة
 * Banner component for critical announcements
 */
export function AdminAnnouncementsBanner() {
  const { data: bannerAnnouncement, isLoading } = useAnnouncements('banner');
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading || !bannerAnnouncement || isDismissed) return null;

  const isCritical = bannerAnnouncement.priority === 'CRITICAL';
  const isHigh = bannerAnnouncement.priority === 'HIGH';

  const handleDismiss = () => {
    // حفظ في localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `dismissed-announcement-${bannerAnnouncement.id}`,
        'true'
      );
    }
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Alert 
          className={`relative ${
            isCritical 
              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
              : isHigh
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
              : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">إخفاء</span>
          </Button>

          <AlertTitle className="flex items-center gap-2 pr-8">
            {bannerAnnouncement.title}
            <Badge 
              variant={isCritical ? 'destructive' : isHigh ? 'default' : 'secondary'}
              className="text-xs"
            >
              {isCritical ? '🚨 عاجل' : isHigh ? '⚠️ مهم' : '📢 إعلان'}
            </Badge>
          </AlertTitle>

          <AlertDescription className="mt-2">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: bannerAnnouncement.bodyMd.substring(0, 200) 
              }}
            />
            
            {bannerAnnouncement.bodyMd.length > 200 && (
              <Button 
                variant="link" 
                size="sm"
                className="p-0 h-auto mt-2"
                onClick={() => {
                  // TODO: فتح modal أو التنقل لصفحة التفاصيل
                }}
              >
                اقرأ المزيد <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
            )}
          </AlertDescription>

          {bannerAnnouncement.attachments && bannerAnnouncement.attachments.length > 0 && (
            <div className="mt-3 flex gap-2">
              {bannerAnnouncement.attachments.slice(0, 3).map((attachment: any) => (
                <img
                  key={attachment.id}
                  src={attachment.url}
                  alt={attachment.alt || 'مرفق'}
                  className="h-16 w-16 object-cover rounded"
                />
              ))}
            </div>
          )}
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
