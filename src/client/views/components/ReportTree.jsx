import React, { useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import LaunchIcon from "@material-ui/icons/Launch";
import ReportTreeRings from "./ReportTreeRings";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import dispatchReport from "../hocs/dispatchReport";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import useResize from "../hooks/useResize";
import withReportById from "../hocs/withReportById";

const ReportTree = ({
  reportId,
  tree,
  chartRef,
  containerRef,
  ratio,
  fetchReport,
  topLevel,
  permaLink,
}) => {
  if (!tree.report) return null;
  const navigate = useNavigate();
  let maxDepth = tree.report.tree.maxDepth;

  const updateQuery = ({ root, name, depth }) => {
    let { query: x, ...options } = tree.report.xQuery;
    let queryObj = qs.parse(tree.report.queryString);
    let y = queryObj.y;
    if (root) {
      if (x.match("tax_tree")) {
        x = x.replace(/tax_tree\(\w+?\)/, `tax_tree(${root})`);
      } else {
        x += ` AND tax_tree(${root})`;
      }
    }
    if (
      name == "root" &&
      x.match("tax_depth") &&
      options.includeEstimates === false
    ) {
      x = x.replace(/tax_depth\(\d+\)/, `tax_depth(${maxDepth + 1})`);
      y = y.replace(/tax_depth\(\d+\)/, `tax_depth(${maxDepth + 1})`);
    } else if (depth && x.match("tax_depth")) {
      x = x.replace(/tax_depth\(\d+\)/, `tax_depth(${maxDepth - depth})`);
      y = y.replace(/tax_depth\(\d+\)/, `tax_depth(${maxDepth - depth})`);
    }

    return { ...queryObj, x, y, options };
  };

  const handleNavigation = ({ root, name }) => {
    let newQuery = updateQuery({ root, name });
    let newQueryString = qs.stringify(newQuery);
    if (topLevel) {
      fetchReport({ reportId, queryString: newQueryString, reload: true });
    } else {
      permaLink(newQueryString);
    }
  };

  const handleSearch = ({ root, name, depth }) => {
    if (name == "root") return;
    let { options, y, report, x: query, ...moreOptions } = updateQuery({
      root,
      name,
      depth,
    });
    navigate(
      `/search?${qs.stringify({
        ...options,
        ...moreOptions,
        query,
        fields: y,
      })}#${encodeURIComponent(query)}`
    );
  };

  const componentRef = chartRef ? chartRef : useRef();
  const { width, height } = containerRef
    ? useResize(containerRef)
    : useResize(componentRef);
  let minDim = Math.floor(width);
  if (height) {
    minDim = Math.floor(Math.min(width, height));
  } else {
    minDim /= ratio;
  }

  return (
    <Grid item xs ref={componentRef} style={{ height: "100%" }}>
      <ReportTreeRings
        width={width}
        height={minDim}
        {...tree.report.tree}
        handleNavigation={handleNavigation}
        handleSearch={handleSearch}
      />
    </Grid>
  );
};

export default compose(dispatchReport, withReportById)(ReportTree);
