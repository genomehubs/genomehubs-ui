import React from "react";

export const CellInfo = ({ x, y, count }) => {
  return (
    <div>
      <div>x: {x}</div>
      {y && <div>y: {y}</div>}
      <div>count: {count}</div>
    </div>
  );
};

export default CellInfo;
