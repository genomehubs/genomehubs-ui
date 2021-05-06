import React, { useEffect } from "react";

import LaunchIcon from "@material-ui/icons/Launch";
import { Link } from "@reach/router";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import styles from "./Styles.scss";

const ReportSources = ({ sources }) => {
  let rows = [];
  let sorted = Object.entries(sources || []).sort(
    (a, b) => parseInt(b[1].count || 0) - parseInt(a[1].count || 0)
  );
  sorted.forEach(([key, source], index) => {
    rows.push(
      <TableRow key={index}>
        <TableCell>
          {source.url ? (
            <a href={source.url} target="_blank">
              {key} <LaunchIcon fontSize="inherit" />
            </a>
          ) : (
            key
          )}
        </TableCell>
        <TableCell>
          {source.count ? source.count.toLocaleString() : "-"}
        </TableCell>
        <TableCell>
          {source.attributes && source.attributes.join("; ")}
        </TableCell>
      </TableRow>
    );
  });
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Source</TableCell>
          <TableCell>Values</TableCell>
          <TableCell>Attributes</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{rows}</TableBody>
    </Table>
  );
};

export default ReportSources;
