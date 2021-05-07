import React, { useEffect, Fragment } from "react";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import loadable from "@loadable/component";
import styles from "./Styles.scss";
import withFetchReport from "../hocs/withFetchReport";
import withReportById from "../hocs/withReportById";

const ReportSources = loadable(() => import("./ReportSources"));
const ReportXPerRank = loadable(() => import("./ReportXPerRank"));
const ReportXInY = loadable(() => import("./ReportXInY"));

const ReportItem = ({
  reportId,
  report,
  queryString,
  fetchReport,
  reportById,
  heading,
  caption,
  ...gridProps
}) => {
  useEffect(() => {
    if (!reportById || Object.keys(reportById).length == 0) {
      fetchReport({ reportId, queryString });
    }
  }, [reportId]);
  let component;
  switch (report) {
    case "sources":
      component = <ReportSources sources={reportById} />;
      break;
    case "xPerRank":
      component = <ReportXPerRank perRank={reportById} />;
      break;
    case "xInY":
      console.log(reportById);
      component = <ReportXInY xInY={reportById} />;
      break;
    default:
      console.log(reportById);
      break;
  }
  return (
    <Grid {...gridProps}>
      <Grid container direction="column" spacing={1}>
        <Grid item xs>
          <span className={styles.reportHeading}>{heading}</span>
        </Grid>
        <Grid item xs>
          {component}
        </Grid>
        <Grid item xs>
          <span className={styles.reportCaption}>{caption}</span>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default compose(withFetchReport, withReportById)(ReportItem);
