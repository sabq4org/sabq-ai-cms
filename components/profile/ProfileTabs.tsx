import * as Tabs from '@radix-ui/react-tabs';
import { Bookmark, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileTabs({
  defaultValue = 'profile',
  onChange,
  tabsClassName,
  contentClassName,
}: {
  defaultValue?: 'profile' | 'bookmarks' | 'likes';
  onChange?: (v: string) => void;
  tabsClassName?: string;
  contentClassName?: string;
}) {
  const baseTrigger =
    'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';
  const inactive =
    'bg-white text-gray-700 border-brand-border hover:bg-gray-50';
  const active =
    'bg-brand-primary text-white border-transparent';

  return (
    <Tabs.Root defaultValue={defaultValue} dir="rtl" onValueChange={onChange}>
      <Tabs.List
        className={cn('flex items-center gap-2', tabsClassName)}
        aria-label="التنقل في الملف الشخصي"
      >
        <Tabs.Trigger value="profile" className={cn(baseTrigger, inactive, 'data-[state=active]:', active)}>
          <User className="w-5 h-5" />
          الملف الشخصي
        </Tabs.Trigger>
        <Tabs.Trigger value="bookmarks" className={cn(baseTrigger, inactive, 'data-[state=active]:', active)}>
          <Bookmark className="w-5 h-5" />
          المحفوظات
        </Tabs.Trigger>
        <Tabs.Trigger value="likes" className={cn(baseTrigger, inactive, 'data-[state=active]:', active)}>
          <Heart className="w-5 h-5" />
          الإعجابات
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="profile" className={cn('mt-6', contentClassName)}>
        {/* محتوى الملف الشخصي */}
      </Tabs.Content>
      <Tabs.Content value="bookmarks" className={cn('mt-6', contentClassName)}>
        {/* شبكة المحفوظات */}
      </Tabs.Content>
      <Tabs.Content value="likes" className={cn('mt-6', contentClassName)}>
        {/* شبكة الإعجابات */}
      </Tabs.Content>
    </Tabs.Root>
  );
}
