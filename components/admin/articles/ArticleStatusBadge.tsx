import { Badge } from '@/components/ui/badge';

interface ArticleStatusBadgeProps {
  status: 'draft' | 'review' | 'published';
}

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  const statusConfig = {
    draft: {
      label: 'مسودة',
      variant: 'secondary' as const,
    },
    review: {
      label: 'قيد المراجعة',
      variant: 'warning' as const,
    },
    published: {
      label: 'منشور',
      variant: 'success' as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}