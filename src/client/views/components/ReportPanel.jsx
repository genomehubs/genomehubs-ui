import React, { memo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "@reach/router";

import Grid from "@material-ui/core/Grid";
import ReportFull from "./ReportFull";
import Tooltip from "@material-ui/core/Tooltip";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import qs from "qs";
import styles from "./Styles.scss";
import withReportDefaults from "../hocs/withReportDefaults";

const reportTypes = {
  histogram: { name: "Histogram" },
  scatter: { name: "Scatter" },
  tree: { name: "Tree" },
  xInY: { name: "xInY" },
};

const ReportPanel = ({ options, reportDefaults }) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.textPanel
  );
  const reportRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    if (location.search.match("report=")) {
      reportRef.current.scrollIntoView();
    }
  }, []);

  const navigate = useNavigate();
  const setReport = (report) => {
    navigate(
      `${location.pathname}?${qs.stringify({ ...options, report })}${
        location.hash
      }`
    );
  };
  let { query, ...treeOptions } = options;
  let report = options.report;
  let queryString = qs.stringify({
    ...treeOptions,
    ...reportDefaults[report],
    report,
  });
  // TODO: use mui-grid
  return (
    <div className={css} ref={reportRef} style={{ maxHeight: "100%" }}>
      {/* <div className={styles.header}>
        <span className={styles.title}>{title}</span>
      </div> */}

      {/* {text && <div>{text}</div>} */}
      <Grid container spacing={1} direction="row" style={{ width: "100%" }}>
        {Object.keys(reportTypes).map((key) => {
          let obj = reportTypes[key];
          return (
            <Grid
              item
              style={{ cursor: "pointer" }}
              onClick={() => setReport(key)}
              key={key}
            >
              {obj.name}
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={1} direction="row">
        <ReportFull
          reportId={queryString}
          report={report}
          queryString={queryString}
          topLevel={false}
          inModal={false}
        />
      </Grid>
    </div>
  );
};

export default compose(memo, withReportDefaults)(ReportPanel);
