import React, { useEffect, useState } from "react";

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
import { compose } from "recompose";
import dispatchMessage from "../hocs/dispatchMessage";
import dispatchReport from "../hocs/dispatchReport";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withReportById from "../hocs/withReportById";

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
  reportRef,
  gridRef,
  componentRef,
  minDim = 0,
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
  treeStyle,
  treeThreshold,
  handleUpdate,
  dispatch,
  includeEstimates,
  setMessage,
  saveReport,
  ...gridProps
}) => {
  queryString = qs.stringify({
    xOpts,
    yOpts,
    scatterThreshold,
    treeThreshold,
    ...qs.parse(queryString),
  });
  const navigate = useNavigate();
  const hideMessage = !inModal && !topLevel;
  // const [hideMessage, sethideMessage] = useState(false);

  useEffect(() => {
    if (reportId && (!reportById || Object.keys(reportById).length == 0)) {
      // let hideMessage;
      // if (!inModal && !topLevel) {
      //   sethideMessage(true);
      // }
      setTimeout(
        () => fetchReport({ reportId, queryString, report, hideMessage }),
        delay
      );
    }
  }, [reportId]);

  let status;
  if (reportById && reportById.report && reportById.report[report]) {
    if (reportById.report[report].status) {
      status = reportById.report[report].status;
    }
  }

  useEffect(() => {
    if (
      !hideMessage &&
      status &&
      reportById.report[report].status.success == false
    ) {
      setMessage({
        message: `Unable to load ${report} report`,
        duration: 5000,
        severity: "warning",
      });
    }
  }, [status]);
  let component, error, loading;
  if (!reportById || Object.keys(reportById).length == 0) {
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
    reportById.report[report] &&
    reportById.report[report].status &&
    reportById.report[report].status.success == false
  ) {
    if (setEdit && !hideMessage) {
      setTimeout(() => setEdit(true), 500);
    }
    error = reportById.report[report].status.error;
    component = <ReportError report={report} error={error} />;
    // message = {
    //   message: `Failed to fetch ${report} report`,
    //   duration: 5000,
    //   severity: "error",
    // };
  } else if (reportById.report[report] && reportById.report[report].x == 0) {
    component = <ReportEmpty report={report} />;
    // message = {
    //   message: `No ${report} data to display`,
    //   duration: 5000,
    //   severity: "warning",
    // };
  } else if (!reportById.report[report]) {
    component = <ReportEmpty report={report} />;
    // message = {
    //   message: `No ${report} data to display`,
    //   duration: 5000,
    //   severity: "warning",
    // };
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
            includeEstimates={includeEstimates}
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
            includeEstimates={includeEstimates}
            {...qs.parse(queryString)}
          />
        );
        break;
      case "sources":
        component = (
          <ReportSources
            sources={reportById.report.sources}
            chartRef={chartRef}
            containerRef={containerRef}
          />
        );
        break;
      case "tree":
        if (!permaLink) {
          permaLink = (queryString, toggle) => {
            let path = "report";
            // TODO: include taxonomy
            navigate(`/${path}?${queryString.replace(/^\?/, "")}`);
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
            reportRef={reportRef}
            gridRef={gridRef}
            treeStyle={treeStyle}
            handleUpdate={handleUpdate}
            dispatch={dispatch}
            includeEstimates={includeEstimates}
            treeThreshold={treeThreshold}
            hidePreview={hideMessage}
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
  caption = reportById?.report?.caption;
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
  return (
    <Grid id="tmp" style={{ minHeight: minDim }} {...gridProps}>
      {content}
    </Grid>
  );
};

export default compose(
  dispatchMessage,
  dispatchReport,
  withReportById
)(ReportItem);
