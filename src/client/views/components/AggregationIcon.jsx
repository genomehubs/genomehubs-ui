import Grid from "@material-ui/core/Grid";
import React from "react";
import classnames from "classnames";
import styles from "./Styles.scss";

const AggregationIcon = ({ method }) => {
  const colors = {
    direct: "green",
    descendant: "orange",
    ancestor: "red",
  };
  const heights = {
    direct: "1.02em",
    descendant: "0.68em",
    ancestor: "0.34em",
  };
  return (
    <Grid
      style={{
        minHeight: "1.02em",
        minWidth: "0.34em",
        maxWidth: "0.34em",
        backgroundColor: "#dddddd",
      }}
      container
      spacing={0}
      direction="column"
    >
      <Grid
        item
        xs={1}
        style={{
          backgroundColor: colors[method],
          minHeight: heights[method],
          minWidth: "0.34em",
          maxWidth: "0.34em",
          marginTop: "auto",
        }}
      ></Grid>
    </Grid>
  );
  {
    /* <div className={styles.confidence}>
      <div className={classnames(styles.one, styles[`one${level}`])}></div>
      <div className={classnames(styles.two, styles[`two${level}`])}></div>
      <div className={classnames(styles.three, styles[`three${level}`])}></div>
    </div> */
  }
};

export default AggregationIcon;
