import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";
import withExplore from "../hocs/withExplore";
import withRecord from "../hocs/withRecord";
import withLocation from "../hocs/withLocation";
import withSummary from "../hocs/withSummary";
import HistogramSVG from "./HistogramSVG";
import AggregationIcon from "./AggregationIcon";

const ResultPanel = ({
  scientific_name,
  taxon_id,
  taxon_rank,
  fields,
  chooseView,
  fetchLineage,
  setRecordId,
  fetchRecord,
  summaryField,
  setSummaryField,
  views,
  sequence,
  summaryId,
}) => {
  const handleTaxonClick = () => {
    chooseView("records");
    setRecordId(taxon_id);
  };
  const handleFieldClick = (fieldId) => {
    fetchLineage(taxon_id);
    setRecordId(taxon_id);
    setSummaryField(fieldId);
    chooseView("explore");
  };
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );
  let fieldDivs = [];
  if (fields) {
    fields.forEach((field) => {
      let value = field.value;
      if (Array.isArray(value)) {
        value = value[0];
      }
      value = isNaN(value) ? value : format(",.3s")(value);
      if (Array.isArray(field.value) && field.count > 1) {
        value = `${value} ...`;
      }
      let highlight = null;
      if (views.primary == "explore" && field.id == summaryField) {
        highlight = styles["fieldNameHighlight"];
      }
      fieldDivs.push(
        <div
          key={field.id}
          className={styles.field}
          onClick={() => handleFieldClick(field.id)}
        >
          <div className={classnames(styles.fieldName, highlight)}>
            {field.id}
          </div>
          <div className={styles.fieldValue}>
            <AggregationIcon method={field.aggregation_source} />
            {value}
          </div>
          <div
            className={styles.fieldCount}
          >{`${field.aggregation_method}, n=${field.count}`}</div>
        </div>
      );
    });
  }
  let histogramPlot;
  if (summaryId) {
    histogramPlot = (
      <div style={{ width: "80%" }}>
        <HistogramSVG summaryId={summaryId} sequence={sequence} />
      </div>
    );
  }

  return (
    <div className={css}>
      <div className={styles.header} onClick={handleTaxonClick}>
        <span className={styles.title}>{scientific_name}</span>
        <span> ({taxon_rank})</span>
        <span className={styles.identifier}>
          <span className={styles.identifierPrefix}>taxId:</span>
          {taxon_id}
        </span>
      </div>
      <div style={{ right: "0", top: "2em" }} onClick={handleTaxonClick}>
        <i
          className={classnames(
            styles.arrow,
            styles.arrowRight,
            styles.arrowLarge
          )}
        ></i>
      </div>
      <div>
        <div className={styles.flexRow}>{fieldDivs}</div>
        <div>{histogramPlot}</div>
      </div>
    </div>
  );
};

export default compose(
  withLocation,
  withRecord,
  withSummary,
  withExplore
)(ResultPanel);
