import React, { Fragment, useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import ReportEmpty from "./ReportEmpty";
import ReportError from "./ReportError";
import ReportHistogram from "./ReportHistogram";
import ReportLoading from "./ReportLoading";
import ReportModal from "./ReportModal";
import ReportScatter from "./ReportScatter";
import ReportSources from "./ReportSources";
import ReportTree from "./ReportTree";
import ReportXInY from "./ReportXInY";
import ReportXPerRank from "./ReportXPerRank";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import loadable from "@loadable/component";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withFetchReport from "../hocs/withFetchReport";
import withReportById from "../hocs/withReportById";

// const ReportSources = loadable(() => import("./ReportSources"));
// const ReportXPerRank = loadable(() => import("./ReportXPerRank"));
// const ReportXInY = loadable(() => import("./ReportXInY"));

const headings = {
  tree: "Tap tree nodes to browse taxa or long-press to search",
  histogram: "Tap bins to search",
  scatter: "Tap bins to search",
};

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
  permaLink,
  chartRef,
  containerRef,
  ratio,
  delay = 0,
  stacked,
  cumulative,
  xOpts,
  yOpts,
  scatterThreshold,
  yScale,
  zScale,
  setEdit,
  ...gridProps
}) => {
  queryString = qs.stringify({
    xOpts,
    yOpts,
    scatterThreshold,
    ...qs.parse(queryString),
  });
  useEffect(() => {
    if (!reportById || Object.keys(reportById).length == 0) {
      setTimeout(() => fetchReport({ reportId, queryString }), delay);
    }
  }, [reportId]);
  let component, error, loading;
  if (Object.keys(reportById).length == 0) {
    component = (
      <ReportLoading
        report={report}
        chartRef={chartRef}
        containerRef={containerRef}
        ratio={ratio}
      />
    );
    loading = true;
  } else if (
    reportById.report[report].status &&
    reportById.report[report].status.success == false
  ) {
    if (setEdit) {
      setEdit(true);
    }
    error = reportById.report[report].status.error;
    component = <ReportError report={report} error={error} />;
  } else if (reportById.report[report].x == 0) {
    component = <ReportEmpty report={report} />;
  } else {
    switch (report) {
      case "histogram":
        component = (
          <ReportHistogram
            histogram={reportById}
            chartRef={chartRef}
            containerRef={containerRef}
            ratio={ratio}
            stacked={stacked}
            cumulative={cumulative}
            xOpts={xOpts}
            // yScale={yScale}
            {...qs.parse(queryString)}
          />
        );
        break;
      case "scatter":
        component = (
          <ReportScatter
            scatter={reportById}
            chartRef={chartRef}
            containerRef={containerRef}
            ratio={ratio}
            xOpts={xOpts}
            yOpts={yOpts}
            zScale={zScale}
            scatterThreshold={scatterThreshold}
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
      case "tree":
        if (!permaLink) {
          const navigate = useNavigate();
          permaLink = (queryString, toggle) => {
            let path = "report";
            // TODO: include taxonomy
            navigate(`/${path}?${queryString}`);
          };
        }
        component = (
          <ReportTree
            reportId={reportId}
            topLevel={topLevel}
            permaLink={permaLink}
            ratio={ratio}
            tree={reportById}
            chartRef={chartRef}
            containerRef={containerRef}
            {...qs.parse(queryString)}
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
  }
  heading = heading || headings[report];
  caption = reportById.report?.caption;
  let content = (
    <Grid
      container
      direction="column"
      spacing={1}
      style={{ flexGrow: "1", width: "100%" }}
    >
      {!loading && !error && heading && (inModal || topLevel) && (
        <Grid item xs>
          <span className={styles.reportHeading}>{heading}</span>
        </Grid>
      )}
      <Grid item xs style={{ width: "100%" }}>
        {component}
      </Grid>
      {!loading && !error && caption && (
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
  // if (reportById.report) {
  //   content = (
  //     <Grid container direction="column" width="100%">
  //       <Grid item>{content}</Grid>
  //       <Grid item style={{ textAlign: "left" }}>
  //         {reportById.report.caption}
  //       </Grid>
  //     </Grid>
  //   );
  // }
  return <Grid {...gridProps}>{content}</Grid>;
};

export default compose(withFetchReport, withReportById)(ReportItem);
