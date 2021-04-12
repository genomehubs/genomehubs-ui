import React, { useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import loadable from "@loadable/component";
import styles from "./Styles.scss";
import withFetchReport from "../hocs/withFetchReport";
import withReportById from "../hocs/withReportById";

const ReportSources = loadable(() => import("./ReportSources"));

const ReportItem = ({
  reportId,
  reportType,
  result,
  fetchReport,
  reportById,
}) => {
  useEffect(() => {
    if (!reportById || Object.keys(reportById).length == 0) {
      fetchReport({ reportId, reportType, result });
    }
  }, [reportId]);
  let report;
  switch (reportType) {
    case "sources":
      report = <ReportSources sources={reportById} />;
      break;
    default:
      break;
  }
  return <Grid item>{report}</Grid>;
};

export default compose(withFetchReport, withReportById)(ReportItem);
