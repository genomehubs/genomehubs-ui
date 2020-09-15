import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";
import withExplore from "../hocs/withExplore";
import withRecord from "../hocs/withRecord";
import withLocation from "../hocs/withLocation";
import withSummary from "../hocs/withSummary";
import AggregationIcon from "./AggregationIcon";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

const AttributePanel = ({
  field,
  taxon_id,
  chooseView,
  fetchLineage,
  summaryField,
  setSummaryField,
}) => {
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
  let fieldDivs = [];
  let fieldStats = [];
  if (field) {
    let value = field.value;
    if (Array.isArray(value)) {
      value = value[0];
    }
    value = isNaN(value) ? value : format(",.3s")(value);
    if (Array.isArray(field.value) && field.count > 1) {
      value = `${value} ...`;
    }
    fieldDivs.push(
      <div
        key={field.id}
        className={styles.field}
        onClick={() => handleFieldClick(field.id)}
      >
        <div className={styles.fieldName}>{field.id}</div>
        <div className={styles.fieldValue}>
          <AggregationIcon method={field.aggregation_source} />
          {value}
        </div>
        <div
          className={styles.fieldCount}
        >{`${field.aggregation_method}, n=${field.count}`}</div>
      </div>
    );
    Object.keys(field).forEach((key) => {
      if (key != "id" && key != "values") {
        fieldStats.push(
          <TableRow key={key}>
            <TableCell>{key}</TableCell>
            <TableCell>{field[key]}</TableCell>
          </TableRow>
        );
      }
    });
  }

  return (
    <div className={css}>
      <div className={styles.header}>
        <span className={styles.title}>{field.id}</span>
      </div>
      <div>
        <div className={styles.flexRow}>{fieldDivs}</div>
        <Table>
          <TableBody>{fieldStats}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default compose(
  withLocation,
  withRecord,
  withSummary,
  withExplore
)(AttributePanel);
