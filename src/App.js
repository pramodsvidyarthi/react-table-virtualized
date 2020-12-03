import React from "react";
import styled from "styled-components";
import {
  useTable,
  useFlexLayout,
  useRowSelect,
  useResizeColumns
} from "react-table";
import { useVirtual } from "react-virtual";
import scrollbarWidth from "./scrollbarWidth";

import makeData from "./makeData";

const Styles = styled.div`
  padding: 1rem;

  .table {
    /* display: block; */
    border-spacing: 0;
    border: 1px solid black;
    overflow: auto;

    .header-group {
      position: sticky;
      position: -webkit-sticky;
      z-index: 999;
      top: 0px;

      .th {
        background-color: #ffffff;
      }
    }

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 1px solid black;
      }

      input {
        width: 100%;
        font-size: 1rem;
        padding: 0;
        margin: 0;
        /* border: 0; */
      }
    }

    .resizer {
      display: inline-block;
      background: blue;
      width: 10px;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateX(50%);
      z-index: 1;
      ${"" /* prevents from scrolling while dragging on touch devices */}
      touch-action:none;

      &.isResizing {
        background: red;
      }
    }
  }
`;

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateData // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

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

function Table({ columns, data, updateData, skipPageReset }) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      width: 150
    }),
    []
  );

  // const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    // totalColumnsWidth,
    prepareRow
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      skipPageReset: !skipPageReset,
      autoResetSelectedRows: false,
      updateData,
      something: (f) => f
    },
    useFlexLayout,
    useRowSelect,
    useResizeColumns,
    (hooks) => {
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
  );

  const parentRef = React.useRef();

  const rowVirtualizer = useVirtual({
    size: rows.length,
    parentRef,
    estimateSize: React.useCallback((i) => 35, []),
    overscan: 5
  });

  const RenderRow = React.useCallback(
    ({ row }) => {
      prepareRow(row);
      return (
        <div {...row.getRowProps()} className="tr">
          {row.cells.map((cell) => {
            return (
              <div {...cell.getCellProps()} className="td">
                {cell.render("Cell")}
              </div>
            );
          })}
        </div>
      );
    },
    [prepareRow]
  );

  // Render the UI for your table
  return (
    <div
      {...getTableProps()}
      className="table"
      ref={parentRef}
      style={{
        height: `400px`,
        width: "inherit",
        overflow: "auto"
      }}
    >
      <div className="header-group">
        {headerGroups.map((headerGroup) => (
          <div {...headerGroup.getHeaderGroupProps()} className="tr">
            {headerGroup.headers.map((column) => (
              <div {...column.getHeaderProps()} className="th">
                {column.render("Header")}
                <div
                  {...column.getResizerProps()}
                  className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div {...getTableBodyProps()}>
        <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: "100%",
            position: "relative"
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => {
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <RenderRow row={rows[virtualRow.index]} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Row Index",
        accessor: (row, i) => `row-${i + 1}`
      },
      {
        Header: "Name",
        columns: [
          {
            Header: "First Name",
            accessor: "firstName",
            Cell: EditableCell
          },
          {
            Header: "Last Name",
            accessor: "lastName"
          },
          {
            Header: "Full Name",
            accessor: (row) => `${row.firstName} ${row.lastName}`,
            Cell: ({ value }) => <div>{value}</div>
          }
        ]
      },
      {
        Header: "Info",
        columns: [
          {
            Header: "Age",
            accessor: "age",
            width: 50
          },
          {
            Header: "Visits",
            accessor: "visits",
            width: 60
          },
          {
            Header: "Status",
            accessor: "status"
          },
          {
            Header: "Profile Progress",
            accessor: "progress"
          }
        ]
      }
    ],
    []
  );

  const [data, setData] = React.useState(() => makeData(10000));
  const skipPageResetRef = React.useRef();
  const updateData = (rowIndex, columnId, value) => {
    skipPageResetRef.current = true;
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value
          };
        }
        return row;
      })
    );
  };

  React.useEffect(() => {
    // After the table has updated, always remove the flag
    skipPageResetRef.current = false;
  }, [data]);

  return (
    <Styles>
      <Table
        columns={columns}
        data={data}
        updateData={updateData}
        skipPageReset={skipPageResetRef.current}
      />
    </Styles>
  );
}

export default App;
