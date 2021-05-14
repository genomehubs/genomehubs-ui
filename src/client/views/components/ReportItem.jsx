import React, { useEffect, Fragment } from "react";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import loadable from "@loadable/component";
import styles from "./Styles.scss";
import withFetchReport from "../hocs/withFetchReport";
import withReportById from "../hocs/withReportById";
import ReportModal from "./ReportModal";
import ReportSources from "./ReportSources";
import ReportXPerRank from "./ReportXPerRank";
import ReportXInY from "./ReportXInY";

// const ReportSources = loadable(() => import("./ReportSources"));
// const ReportXPerRank = loadable(() => import("./ReportXPerRank"));
// const ReportXInY = loadable(() => import("./ReportXInY"));

const ReportItem = ({
  reportId,
  report,
  queryString,
  fetchReport,
  reportById,
  heading,
  caption,
  inModal,
  topLevel,
  chartRef,
  containerRef,
  delay = 0,
  ...gridProps
}) => {
  useEffect(() => {
    if (!reportById || Object.keys(reportById).length == 0) {
      setTimeout(() => fetchReport({ reportId, queryString }), delay);
    }
  }, [reportId]);
  let component;
  switch (report) {
    case "sources":
      component = (
        <ReportSources
          sources={reportById}
          chartRef={chartRef}
          containerRef={containerRef}
        />
      );
      break;
    case "xPerRank":
      component = (
        <ReportXPerRank
          perRank={reportById}
          chartRef={chartRef}
          containerRef={containerRef}
        />
      );
      break;
    case "xInY":
      component = (
        <ReportXInY
          xInY={reportById}
          chartRef={chartRef}
          containerRef={containerRef}
        />
      );
      break;
    default:
      break;
  }
  caption = reportById.report?.caption;
  let content = (
    <Grid
      container
      direction="column"
      spacing={1}
      style={{ height: "100%", flexGrow: "1", width: "100%" }}
    >
      {heading && (
        <Grid item xs>
          <span className={styles.reportHeading}>{heading}</span>
        </Grid>
      )}
      <Grid item xs style={{ height: "100%", width: "100%" }}>
        {component}
      </Grid>
      {caption && !inModal && !topLevel && (
        <Grid item xs>
          <span className={styles.reportCaption}>{caption}</span>
        </Grid>
      )}
    </Grid>
  );
  if (!inModal) {
    content = (
      <ReportModal
        reportId={reportId}
        report={report}
        queryString={queryString}
        heading={heading}
        caption={caption}
      >
        {content}
      </ReportModal>
    );
  }
  return (
    <Grid {...gridProps} style={{ height: "100%" }}>
      {content}
    </Grid>
  );
};

export default compose(withFetchReport, withReportById)(ReportItem);
