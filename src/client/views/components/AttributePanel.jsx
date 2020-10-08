import React, { useState } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { makeStyles } from "@material-ui/core/styles";
import withExplore from "../hocs/withExplore";
import withRecord from "../hocs/withRecord";
import withLocation from "../hocs/withLocation";
import withSummary from "../hocs/withSummary";
import AggregationIcon from "./AggregationIcon";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Box";
import Box from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import { formatter } from "../functions/formatter";
import loadable from "@loadable/component";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import TablePagination from "@material-ui/core/TablePagination";

const LocationMap = loadable(() => import("./LocationMap"));

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

const NestedTable = ({ values }) => {
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
        <Table size="small" aria-label="purchases">
          <TableHead>
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>Source</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {values
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {row.value}
                  </TableCell>
                  <TableCell>{row.source}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={values.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </span>
  );
};

const AttributePanel = ({
  field,
  meta,
  taxon_id,
  chooseView,
  fetchLineage,
  summaryField,
  setSummaryField,
}) => {
  const [open, setOpen] = useState(false);
  const handleFieldClick = (fieldId) => {
    fetchLineage(taxon_id);
    setSummaryField(fieldId);
    chooseView("explore");
  };
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

    if (source == "direct") {
      raw = (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={colSpan}
          >
            <Collapse in={open.toString()} timeout="auto">
              <NestedTable values={field.values} />
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
        <div>
          <LocationMap geoPoints={geoPoints} zoom={zoom} />
        </div>
      )}
    </div>
  );
};

export default compose(
  withLocation,
  withRecord,
  withSummary,
  withExplore
)(AttributePanel);
