declare module "react-virtualized" {
  import React from "react";
  import { CellMeasurerCache } from "react-virtualized";

  export const AutoSizer: React.FC<{
    children: (props: { width: number; height: number }) => React.ReactNode;
    disableWidth?: boolean;
  }>;

  export const List: React.FC<{
    className?: string;
    deferredMeasurementCache?: CellMeasurerCache;
    width: number;
    height: number;
    rowHeight: number;
    rowRenderer: (rowProps: {
      index: number;
      key: string;
      style: React.CSSProperties;
      parent: React.ReactNode;
    }) => JSX.Element;
    rowCount: number;
    overscanRowCount?: number;
    scrollToAlignment?: "start" | "end" | "center";
    scrollToIndex?: number;
    onScroll?: (props: {
      clientHeight: number;
      clientWidth: number;
      scrollHeight: number;
      scrollLeft: number;
      scrollTop: number;
      scrollWidth: number;
    }) => void;
  }>;

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

  export { CellMeasurerCache };
}
