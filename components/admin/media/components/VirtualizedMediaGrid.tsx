"use client";
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { MediaAsset } from '@/app/admin/modern/media/types';
import OptimizedImage from './OptimizedImage';

interface Props {
  assets: MediaAsset[];
  columnWidth?: number;
  rowHeight?: number;
  gap?: number;
  onSelect: (id: string) => void;
  isSelected: (id: string) => boolean;
  onOpen: (asset: MediaAsset) => void;
}

// NOTE: لاحقاً دمج نفس منطق البطاقة الحالية (تبسيط الآن)
const VirtualizedMediaGrid = ({ assets, columnWidth = 180, rowHeight = 210, gap = 12, onSelect, isSelected, onOpen }: Props) => {
  const columnCount = Math.max(1, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / (columnWidth + gap)));
  const rowCount = Math.ceil(assets.length / columnCount);

  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= assets.length) return null;
    const asset = assets[index];
    const imageHeight = rowHeight - 80; // leave space for filename & padding
    return (
      <div
        style={{ ...style, left: (style.left as number) + gap, top: (style.top as number) + gap, width: columnWidth, height: rowHeight - gap }}
        className={cn('rounded-lg border p-2 bg-gray-50 dark:bg-gray-800 cursor-pointer relative group', isSelected(asset.id) && 'ring-2 ring-blue-500')}
        onClick={() => onSelect(asset.id)}
        onDoubleClick={() => onOpen(asset)}
      >
        <div className="w-full overflow-hidden relative flex items-center justify-center" style={{ height: imageHeight }}>
          {asset.type === 'IMAGE' ? (
            <OptimizedImage
              src={asset.thumbnailUrl || asset.cloudinaryUrl}
              alt={asset.filename}
              fill
              className="object-contain max-w-full max-h-full p-1"
              sizeHint={columnWidth}
            />
          ) : (
            <span className="text-xs text-gray-500">{asset.type}</span>
          )}
        </div>
        <p className="text-xs mt-2 truncate" title={asset.filename}>{asset.filename}</p>
      </div>
    );
  }, [assets, columnCount, columnWidth, rowHeight, gap, onSelect, onOpen, isSelected]);

  return (
    <div className="h-[600px]">
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            columnCount={columnCount}
            columnWidth={columnWidth + gap}
            height={height}
            rowCount={rowCount}
            rowHeight={rowHeight}
            width={width}
          >
            {Cell as any}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
};

export default memo(VirtualizedMediaGrid);
