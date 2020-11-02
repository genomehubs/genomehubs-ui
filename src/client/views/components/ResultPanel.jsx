import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { formatter } from "../functions/formatter";
import withRecord from "../hocs/withRecord";
import withSummary from "../hocs/withSummary";
import HistogramSVG from "./HistogramSVG";
import WordCloud from "./WordCloud";
import Tooltip from "@material-ui/core/Tooltip";
import AggregationIcon from "./AggregationIcon";
import { useLocation, useNavigate } from "@reach/router";

const ResultPanel = ({
  scientific_name,
  taxon_id,
  taxon_rank,
  fields,
  // fetchRecord,
  summaryField,
  setSummaryField,
  sequence,
  summaryId,
  summary,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleTaxonClick = () => {
    navigate(
      `records?taxon_id=${taxon_id}#${encodeURIComponent(scientific_name)}`
    );
    // setRecordId(taxon_id);
  };
  const handleFieldClick = (fieldId) => {
    // fetchLineage(taxon_id);
    // setRecordId(taxon_id);
    setSummaryField(fieldId);
    navigate(
      `explore?taxon_id=${taxon_id}&field_id=${fieldId}${location.hash}`
    );
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
      value = isNaN(value) ? value : formatter(value);
      if (Array.isArray(field.value) && field.count > 1) {
        value = `${value} ...`;
      }
      let highlight = null;
      if (location.pathname == "/view/explore" && field.id == summaryField) {
        highlight = styles["fieldNameHighlight"];
      }
      fieldDivs.push(
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
        <div>{summaryPlot}</div>
      </div>
    </div>
  );
};

export default compose(withRecord, withSummary)(ResultPanel);
