import React, { Fragment, useState } from "react";
import { useLocation, useNavigate } from "@reach/router";

import Box from "@material-ui/core/TableContainer";
import Collapse from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
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
import qs from "qs";
import styles from "./Styles.scss";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
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
              let linkCell = (
                <TableCell>
                  {link_url ? (
                    <a href={link_url} target="_blank">
                      {link} <LaunchIcon fontSize="inherit" />
                    </a>
                  ) : (
                    link
                  )}
                </TableCell>
              );
              return (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {row.value}
                  </TableCell>
                  {row.source_description ? (
                    <Tooltip
                      title={row.source_description}
                      arrow
                      placement={"top"}
                    >
                      {linkCell}
                    </Tooltip>
                  ) : (
                    linkCell
                  )}
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
  );
};

const AttributeTableRow = ({
  attributeId,
  taxonId,
  meta,
  currentResult,
  types,
  setSummaryField,
  setPreferSearchTerm,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const handleAncestorClick = (fieldId, ancTaxonId) => {
    // setSummaryField(fieldId);
    // setPreferSearchTerm(false);
    // navigate(
    //   `explore?taxon_id=${taxonId}&result=${currentResult}&field_id=${fieldId}${location.hash}`
    // );
    let options = {
      query: `tax_tree(${ancTaxonId})`,
      result: currentResult,
      includeEstimates: false,
      fields: fieldId,
      summaryValues: "count",
    };
    navigate(
      `search?${qs.stringify(options)}#${encodeURIComponent(options.query)}`
    );
  };

  const handleDescendantClick = (fieldId) => {
    let options = {
      query: `tax_tree(${taxonId})`,
      result: currentResult,
      includeEstimates: false,
      fields: fieldId,
      summaryValues: "count",
    };
    navigate(
      `search?${qs.stringify(options)}#${encodeURIComponent(options.query)}`
    );
  };

  const classes = useRowStyles();
  let fieldKeys = [];
  let fieldValues = [];
  let raw;
  let zoom;
  let geoPoints;

  if (attributeId) {
    if (attributeId == "sample_location") {
      geoPoints = meta.value;
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
    let aggSource;
    let colSpan = 0;
    fieldValues.push(<TableCell key={"attribute"}>{attributeId}</TableCell>);

    keys.forEach((key) => {
      if (meta.hasOwnProperty(key.key)) {
        let css;
        let icon;
        if (key.key == "aggregation_source") {
          css = classnames(
            styles.underscore,
            styles[`underscore${confidence[meta[key.key]]}`]
          );
          source = meta[key.key];
          aggSource = formatter(source);
          if (meta[key.key] == "direct") {
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
          } else if (meta[key.key] == "descendant") {
            icon = (
              <span className={styles.disableTheme}>
                <IconButton
                  aria-label="show descendant values"
                  size="small"
                  onClick={() => handleDescendantClick(attributeId)}
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              </span>
            );
          } else if (meta[key.key] == "ancestor") {
            icon = (
              <span className={styles.disableTheme}>
                <IconButton
                  aria-label="show ancestral values"
                  size="small"
                  onClick={() =>
                    handleAncestorClick(attributeId, meta.aggregation_taxon_id)
                  }
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              </span>
            );
            if (meta.aggregation_rank) {
              aggSource = (
                <Tooltip
                  title={`source rank: ${meta.aggregation_rank}`}
                  arrow
                  placement={"top"}
                >
                  <span>{aggSource}</span>
                </Tooltip>
              );
            }
          }
        }
        fieldValues.push(
          <TableCell key={key.key}>
            <span className={css}>{aggSource}</span>
            {icon}
          </TableCell>
        );
        colSpan++;
      }
    });

    if (source == "direct" && meta.values) {
      raw = (
        <TableRow>
          <TableCell></TableCell>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={colSpan}
          >
            <Collapse in={open.toString()} timeout="auto">
              <NestedTable types={types[attributeId]} values={meta.values} />
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }
  }
  let header = (
    <span className={styles.title}>
      {attributeId}
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
    <Fragment>
      <TableRow className={classes.root}>{fieldValues}</TableRow>
      {open && raw}

      {zoom && (
        <Fragment>
          <LocationMap geoPoints={geoPoints} zoom={zoom} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default compose(
  withRecord,
  withSummary,
  withSearch,
  withTypes
)(AttributeTableRow);
