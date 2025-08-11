declare module 'react-window' {
  // Minimal type declarations fallback (package @types/react-window may not be available or failed to resolve)
  import * as React from 'react';
  export interface GridChildComponentProps {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
    data?: any;
    isScrolling?: boolean;
    isVisible?: boolean;
    key?: any;
  }
  export interface FixedSizeGridProps {
    columnCount: number;
    columnWidth: number | ((index: number) => number);
    height: number;
    rowCount: number;
    rowHeight: number | ((index: number) => number);
    width: number;
    children: React.ComponentType<GridChildComponentProps>;
    className?: string;
    style?: React.CSSProperties;
    itemData?: any;
    initialScrollLeft?: number;
    initialScrollTop?: number;
    overscanRowCount?: number;
    overscanColumnCount?: number;
  }
  export class FixedSizeGrid extends React.Component<FixedSizeGridProps> {}
}
