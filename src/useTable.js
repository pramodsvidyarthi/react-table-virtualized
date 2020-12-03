import React from "react";
import {
  useTable,
  useFlexLayout,
  useRowSelect,
  useResizeColumns
} from "react-table";
import { useVirtualizedTable } from "./useVirtualizedTable";
import { useRowSelectCheckbox } from "./useRowSelectCheckbox";

function useMyTable({ data, updateData, ...rest }) {
  const skipPageResetRef = React.useRef();
  const _updateData = (...args) => {
    skipPageResetRef.current = true;
    updateData(...args);
  };

  React.useEffect(() => {
    // After the table has updated, always remove the flag
    skipPageResetRef.current = false;
  }, [data]);

  return useTable(
    {
      data,
      skipPageReset: !skipPageResetRef.current,
      autoResetSelectedRows: !skipPageResetRef.current,
      updateData: _updateData,
      ...rest
    },
    useFlexLayout,
    useRowSelect,
    useResizeColumns,
    useRowSelectCheckbox,
    useVirtualizedTable
  );
}

export default useMyTable;
