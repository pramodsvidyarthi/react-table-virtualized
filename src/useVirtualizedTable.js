import React from "react";
import { useVirtual } from "react-virtual";

export const useVirtualizedTable = (hooks) => {
  hooks.useInstance.push(useInstance);
  hooks.getTableBodyProps.push(getTableBodyStyles);
  hooks.getTableProps.push(getTableStyles);
  hooks.getRowProps.push(getRowStyles);
};

const getRowStyles = (props, { instance, row }) => {
  const virtualRow = instance.rowVirtualizer.virtualItems.find(
    (item) => item.index === Number(row.id)
  );
  return [
    props,
    {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`
      }
    }
  ];
};

const getTableBodyStyles = (props, { instance }) => [
  props,
  {
    style: {
      height: `${instance.rowVirtualizer.totalSize}px`,
      width: "100%",
      position: "relative"
    }
  }
];

const getTableStyles = (props, { instance }) => [
  props,
  {
    ref: instance.virtualizerParentRef,
    style: {
      height: `400px`,
      width: "inherit",
      overflow: "auto"
    }
  }
];

function useInstance(instance) {
  const { data } = instance;
  const virtualizerParentRef = React.useRef();

  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef: virtualizerParentRef,
    estimateSize: React.useCallback((i) => 35, []),
    overscan: 5
  });

  Object.assign(instance, { virtualizerParentRef, rowVirtualizer });
}
