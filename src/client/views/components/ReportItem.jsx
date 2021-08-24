import React, { Fragment, useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import ReportHistogram from "./ReportHistogram";
import ReportModal from "./ReportModal";
import ReportSources from "./ReportSources";
import ReportXInY from "./ReportXInY";
import ReportXPerRank from "./ReportXPerRank";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import loadable from "@loadable/component";
import qs from "qs";
import styles from "./Styles.scss";
import withFetchReport from "../hocs/withFetchReport";
import withReportById from "../hocs/withReportById";

// const ReportSources = loadable(() => import("./ReportSources"));
// const ReportXPerRank = loadable(() => import("./ReportXPerRank"));
// const ReportXInY = loadable(() => import("./ReportXInY"));

const ReportItem = ({
  reportId,
  report,
  disableModal,
  queryString,
  fetchReport,
  reportById,
  heading,
  caption,
  inModal,
  topLevel,
  chartRef,
  containerRef,
  ratio,
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
    case "histogram":
      component = (
        <ReportHistogram
          histogram={reportById}
          chartRef={chartRef}
          containerRef={containerRef}
          ratio={ratio}
          {...qs.parse(queryString)}
        />
      );
      break;
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
          ratio={ratio}
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
      style={{ flexGrow: "1", width: "100%" }}
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
        <Grid item xs style={{ textAlign: "center" }}>
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
        disableModal={disableModal}
        queryString={queryString}
        heading={heading}
        caption={caption}
      >
        {content}
      </ReportModal>
    );
  }
  return <Grid {...gridProps}>{content}</Grid>;
};

export default compose(withFetchReport, withReportById)(ReportItem);
