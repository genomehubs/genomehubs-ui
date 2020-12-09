import { useLocation, useNavigate } from "@reach/router";

import AggregationIcon from "./AggregationIcon";
import HistogramSVG from "./HistogramSVG";
import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import WordCloud from "./WordCloud";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import styles from "./Styles.scss";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withTypes from "../hocs/withTypes";

const ResultPanel = ({
  scientific_name,
  taxon_id,
  taxon_rank,
  fields,
  summaryField,
  setSummaryField,
  setPreferSearchTerm,
  searchIndex,
  sequence,
  summaryId,
  summary,
  types,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleTaxonClick = () => {
    setPreferSearchTerm(false);
    navigate(
      `records?taxon_id=${taxon_id}&result=${searchIndex}#${encodeURIComponent(
        scientific_name
      )}`
    );
    // setRecordId(taxon_id);
  };
  const handleFieldClick = (fieldId) => {
    // fetchLineage(taxon_id);
    // setRecordId(taxon_id);
    setSummaryField(fieldId);
    setPreferSearchTerm(false);
    navigate(
      `explore?taxon_id=${taxon_id}&result=${searchIndex}&field_id=${fieldId}${encodeURIComponent(
        location.hash
      )}`
    );
  };
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );
  let fieldDivs = [];
  let additionalDivs = [];
  if (fields) {
    fields.forEach((field) => {
      let value = field.value;
      if (Array.isArray(value)) {
        value = value[0];
      }
      value = isNaN(value) ? value : formatter(value);
      if (Array.isArray(field.value) && field.count > 1) {
        value = `${value} ...`;
      }
      let highlight = null;
      if (location.pathname == "/view/explore" && field.id == summaryField) {
        highlight = styles["fieldNameHighlight"];
      }
      let newDiv = (
        <Tooltip key={field.id} title={"Click to view summary plot"} arrow>
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
        </Tooltip>
      );
      if (types[field.id] && types[field.id].display_level == 1) {
        fieldDivs.push(newDiv);
      } else {
        additionalDivs.push(newDiv);
      }
    });
  }
  let summaryPlot;
  if (summaryId) {
    if (summary == "histogram") {
      summaryPlot = (
        <div style={{ width: "80%" }}>
          <HistogramSVG
            summaryId={summaryId}
            scientific_name={scientific_name}
            sequence={sequence}
          />
        </div>
      );
    } else if (summary == "terms") {
      summaryPlot = (
        <div style={{ width: "80%" }}>
          <WordCloud
            summaryId={summaryId}
            scientific_name={scientific_name}
            sequence={sequence}
          />
        </div>
      );
    }
  }

  return (
    <div className={css}>
      <Tooltip title={"Click to view record"} arrow placement="top">
        <div className={styles.header} onClick={handleTaxonClick}>
          <span className={styles.title}>{scientific_name}</span>
          <span> ({taxon_rank})</span>
          <span className={styles.identifier}>
            <span className={styles.identifierPrefix}>taxId:</span>
            {taxon_id}
          </span>
        </div>
      </Tooltip>
      {location.pathname != "/view/records" && (
        <div style={{ right: "0", top: "2em" }} onClick={handleTaxonClick}>
          <Tooltip title={"Click to view record"} arrow>
            <i
              className={classnames(
                styles.arrow,
                styles.arrowRight,
                styles.arrowLarge
              )}
            ></i>
          </Tooltip>
        </div>
      )}

      <div>
        <div className={styles.flexRow}>{fieldDivs}</div>
        {additionalDivs.length > 0 && (
          <div className={styles.flexRow}>{additionalDivs}</div>
        )}
        <div>{summaryPlot}</div>
      </div>
    </div>
  );
};

export default compose(
  withRecord,
  withSearch,
  withSummary,
  withTypes
)(ResultPanel);
