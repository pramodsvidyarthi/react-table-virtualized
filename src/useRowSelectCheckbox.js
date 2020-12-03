import React from "react";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

export function useRowSelectCheckbox(hooks) {
  hooks.visibleColumns.push((columns) => [
    // Let's make a column for selection
    {
      id: "selection",
      // The header can use the table's getToggleAllRowsSelectedProps method
      // to render a checkbox
      width: 50,
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <div>
          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        </div>
      ),
      // The cell can use the individual row's getToggleRowSelectedProps method
      // to the render a checkbox
      Cell: ({ row }) => (
        <div>
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        </div>
      )
    },
    ...columns
  ]);
}
