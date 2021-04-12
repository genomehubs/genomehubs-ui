import Grid from "@material-ui/core/Grid";
import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import styles from "./Styles.scss";
import withPanes from "../hocs/withPanes";

const ReportPanel = ({ title, children }) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.textPanel
  );
  // TODO: use mui-grid
  return (
    <div className={css}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
      </div>

      <Grid container spacing={1} direction="row">
        {children}
      </Grid>
    </div>
  );
};

export default compose()(ReportPanel);
