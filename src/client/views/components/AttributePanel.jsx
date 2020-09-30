import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
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
import Tooltip from "@material-ui/core/Tooltip";
import { formatter } from "../functions/formatter";
import loadable from "@loadable/component";

const LocationMap = loadable(() => import("./LocationMap"));

const AttributePanel = ({
  field,
  meta,
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

  let fieldKeys = [];
  let fieldValues = [];
  let zoom;
  let geoPoints;

  if (field) {
    if (field.id == "sample_location") {
      geoPoints = field.value;
      zoom = 10;
    }
    //   let value = field.value;
    //   if (Array.isArray(value)) {
    //     value = value[0];
    //   }
    //   value = formatter(value);
    //   if (Array.isArray(field.value) && field.count > 1) {
    //     value = `${value} ...`;
    //   }
    //   fieldDivs.push(
    //     <div
    //       key={field.id}
    //       className={styles.field}
    //       onClick={() => handleFieldClick(field.id)}
    //     >
    //       <div className={styles.fieldName}>{field.id}</div>
    //       <div className={styles.fieldValue}>
    //         <AggregationIcon method={field.aggregation_source} />
    //         {value}
    //       </div>
    //       <div
    //         className={styles.fieldCount}
    //       >{`${field.aggregation_method}, n=${field.count}`}</div>
    //     </div>
    //   );

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
    keys.forEach((key) => {
      if (field.hasOwnProperty(key.key)) {
        let css;
        if (key.key == "aggregation_source") {
          css = classnames(
            styles.underscore,
            styles[`underscore${confidence[field[key.key]]}`]
          );
        }
        fieldKeys.push(<TableCell key={key.key}>{key.display}</TableCell>);
        fieldValues.push(
          <TableCell key={key.key}>
            <span className={css}>{formatter(field[key.key])}</span>
          </TableCell>
        );
      }
    });
  }
  return (
    <div className={css}>
      <div className={styles.header}>
        <span className={styles.title}>
          {field.id}
          {meta.units && <span> ({meta.units})</span>}
        </span>
      </div>
      <div>
        <Table size={"small"} className={styles.autoWidth}>
          <TableHead>
            <TableRow>{fieldKeys}</TableRow>
          </TableHead>
          <TableBody>
            <TableRow>{fieldValues}</TableRow>
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
