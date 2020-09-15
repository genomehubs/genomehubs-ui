import React from "react";
import classnames from "classnames";
import styles from "./Styles.scss";

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

export default AggregationIcon;
