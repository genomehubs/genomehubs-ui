import React, { useState } from "react";

import AggregationIcon from "./AggregationIcon";
import Box from "@material-ui/core/TableContainer";
import Collapse from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import LaunchIcon from "@material-ui/icons/Launch";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import loadable from "@loadable/component";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withRecord from "../hocs/withRecord";
import withSummary from "../hocs/withSummary";
import withTypes from "../hocs/withTypes";

const LocationMap = loadable(() => import("./LocationMap"));

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const NestedTable = ({ values, types }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  return (
    <span className={styles.disableTheme}>
      <Box margin={1}>
        <Table size="small" aria-label="raw values">
          <TableHead>
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Comment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {values
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, i) => {
                let link, link_url;
                link = row.source;
                let url_stub = row.source_url_stub || types.source_url_stub;
                let url = row.source_url || types.source_url || types.url;
                if (url_stub) {
                  if (row.source_slug) {
                    link_url = `${url_stub}${row.source_slug}`;
                    link = `${link} [${row.source_slug}]`;
                  } else {
                    link_url = url ? url : url_stub;
                  }
                } else if (url) {
                  link_url = url;
                }
                return (
                  <TableRow key={i}>
                    <TableCell component="th" scope="row">
                      {row.value}
                    </TableCell>
                    <TableCell>
                      {link_url ? (
                        <a href={link_url} target="_blank">
                          {link} <LaunchIcon fontSize="inherit" />
                        </a>
                      ) : (
                        link
                      )}
                    </TableCell>
                    <TableCell>{row.comment}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        {values.length > 5 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={values.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </Box>
    </span>
  );
};

const AttributePanel = ({ field, meta, types }) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );

  const classes = useRowStyles();
  let fieldKeys = [];
  let fieldValues = [];
  let raw;
  let zoom;
  let geoPoints;

  if (field) {
    if (field.id == "sample_location") {
      geoPoints = field.value;
      zoom = 10;
    }

    const keys = [
      { key: "value", display: "value" },
      { key: "count", display: "n" },
      { key: "min", display: "min" },
      { key: "max", display: "max" },
      { key: "mean", display: "mean" },
      { key: "median", display: "median" },
      { key: "mode", display: "mode" },
      { key: "list", display: "list" },
      { key: "aggregation_source", display: "source" },
    ];
    const confidence = {
      direct: "High",
      descendant: "Medium",
      ancestor: "Low",
    };
    let source;
    let colSpan = 0;
    keys.forEach((key) => {
      if (field.hasOwnProperty(key.key)) {
        let css;
        let icon;
        if (key.key == "aggregation_source") {
          css = classnames(
            styles.underscore,
            styles[`underscore${confidence[field[key.key]]}`]
          );
          source = field[key.key];
          if (field[key.key] == "direct") {
            icon = (
              <span className={styles.disableTheme}>
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </span>
            );
          }
        }
        fieldKeys.push(<TableCell key={key.key}>{key.display}</TableCell>);
        fieldValues.push(
          <TableCell key={key.key}>
            <span className={css}>{formatter(field[key.key])}</span>
            {icon}
          </TableCell>
        );
        colSpan++;
      }
    });

    if (source == "direct" && field.values) {
      raw = (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={colSpan}
          >
            <Collapse in={open.toString()} timeout="auto">
              <NestedTable types={types[field.id]} values={field.values} />
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }
  }
  let header = (
    <span className={styles.title}>
      {field.id}
      {meta && meta.units && <span> ({meta.units})</span>}
    </span>
  );
  if (meta && meta.description) {
    header = (
      <Tooltip title={meta.description} arrow placement={"top"}>
        {header}
      </Tooltip>
    );
  }
  return (
    <div className={css}>
      <div className={styles.header}>{header}</div>
      <div>
        <Table size={"small"} className={styles.autoWidth}>
          <TableHead>
            <TableRow>{fieldKeys}</TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.root}>{fieldValues}</TableRow>
            {open && raw}
          </TableBody>
        </Table>
      </div>
      {zoom && (
        <div className={styles.disableTheme}>
          <LocationMap geoPoints={geoPoints} zoom={zoom} />
        </div>
      )}
    </div>
  );
};

export default compose(withRecord, withSummary, withTypes)(AttributePanel);
