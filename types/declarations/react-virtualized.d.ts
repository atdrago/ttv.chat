declare module "react-virtualized" {
  import React, { CSSProperties } from "react";

  export const AutoSizer: React.FC<{
    children: (props: { width: number; height: number }) => React.ReactNode;
    disableWidth?: boolean;
  }>;

  export const List: React.FC<{
    autoHeight?: boolean;
    className?: string;
    deferredMeasurementCache?: CellMeasurerCache;
    estimatedRowSize?: number;
    height: number;
    id?: string;
    noRowsRenderer?: () => JSX.Element;
    onScroll?: (props: {
      clientHeight: number;
      clientWidth: number;
      scrollHeight: number;
      scrollLeft: number;
      scrollTop: number;
      scrollWidth: number;
    }) => void;
    overscanRowCount?: number;
    ref?: React.Ref;
    rowCount: number;
    rowHeight: number;
    rowRenderer: (rowProps: {
      index: number;
      key: string;
      style: React.CSSProperties;
      parent: React.ReactNode;
      isScrolling: boolean;
      isVisible: boolean;
    }) => JSX.Element;
    scrollToAlignment?: "start" | "end" | "center" | "auto";
    scrollToIndex?: number;
    scrollTop?: number;
    style?: CSSProperties;
    tabIndex?: number;
    width: number;
  }>;

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  export class CellMeasurerCache {
    get rowHeight();
    get columnWidth();

    clear(rowIndex: number, columnIndex: number);
    clearAll();

    constructor(options: {
      defaultHeight?: number;
      defaultWidth?: number;
      fixedHeight?: boolean;
      fixedWidth?: boolean;
      minHeight?: number;
      minWidth?: number;
      keyMapper?: unknown;
    });
  }

  export const CellMeasurer: React.FC<{
    key?: string;
    cache: CellMeasurerCache;
    parent: React.ReactNode;
    columnIndex: number;
    rowIndex: number;
    children:
      | React.ReactNode
      | ((props: {
          measure: () => void;
          registerChild: React.Ref;
        }) => React.ReactNode);
  }>;
}
