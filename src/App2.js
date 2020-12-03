import React from "react";
import styled from "styled-components";
import useTable from "./useTable";
import makeData from "./makeData";

// {rowVirtualizer.virtualItems.map((virtualRow) => {
//   const row = rows[virtualRow.index];
//   prepareRow(row);
//   return (
//     <div {...row.getRowProps()} className="tr">
//       {row.cells.map((cell) => {
//         return (
//           <div {...cell.getCellProps()} className="td">
//             {cell.render("Cell")}
//           </div>
//         );
//       })}
//     </div>
//   );
// })}

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

function Table(props) {
  // Use the state and functions returned from useTable to build your UI

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    rowVirtualizer
  } = props;

  // const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

  // Render the UI for your table
  return (
    <div {...getTableProps()} className="table">
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
        {rowVirtualizer.virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index];
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
        })}
      </div>
    </div>
  );
}

function App() {
  const defaultColumn = React.useMemo(
    () => ({
      width: 150
    }),
    []
  );
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
          }
          // {
          //   Header: "Full Name",
          //   accessor: (row) => `${row.firstName} ${row.lastName}`,
          //   Cell: ({ value }) => <div>{value}</div>
          // }
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

  const [data, setData] = React.useState(() => makeData(1000));
  const updateData = (rowIndex, columnId, value) => {
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

  const tableProps = useTable({
    columns,
    data,
    updateData,
    defaultColumn
  });

  return (
    <Styles>
      <Table {...tableProps} />
    </Styles>
  );
}

export default App;
