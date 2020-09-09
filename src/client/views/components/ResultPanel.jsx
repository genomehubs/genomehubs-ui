import React from "react";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";

const AggregationIcon = ({ method }) => {
  const confidence = {
    direct: "High",
    descendant: "Medium",
    ancestor: "Low",
  };
  let level = confidence[method] || "Low";
  return (
    <div className={styles.confidence}>
      <div className={classnames(styles.one, styles[`one${level}`])}></div>
      <div className={classnames(styles.two, styles[`two${level}`])}></div>
      <div className={classnames(styles.three, styles[`three${level}`])}></div>
    </div>
  );
};

const ResultPanel = (props) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel${props.cols}Column`],
    styles.resultPanel
  );
  let fields = [];
  props.fields.forEach((field) => {
    let value = field.value;
    if (Array.isArray(value)) {
      value = value[0];
    }
    value = isNaN(value) ? value : format(",.3s")(value);
    if (Array.isArray(field.value) && field.count > 1) {
      value = `${value} ...`;
    }
    fields.push(
      <div key={field.id} className={styles.field}>
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
  });
  return (
    <div className={css}>
      <div>
        <span className={styles.title}>{props.scientific_name}</span>
        <span> ({props.taxon_rank})</span>
        <div style={{ float: "right" }}>
          <div className={styles.identifier}>
            <span className={styles.identifierPrefix}>taxId:</span>
            {props.taxon_id}
          </div>
          <i
            className={classnames(
              styles.arrow,
              styles.arrowRight,
              styles.arrowLarge
            )}
          ></i>
        </div>
      </div>
      <div className={styles.flexRow}>{fields}</div>
    </div>
  );
};

export default ResultPanel;
