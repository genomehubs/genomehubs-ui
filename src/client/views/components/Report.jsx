import React, { Fragment, useEffect, useRef } from "react";

import ReportItem from "./ReportItem";
import qs from "qs";
import { useLocation } from "@reach/router";

export const queryPropList = [
  "result",
  "report",
  "x",
  "y",
  "z",
  "cat",
  "rank",
  "taxonomy",
];

const Report = (props) => {
  const location = useLocation();
  const reportRef = useRef();
  let options = qs.parse(location.search.replace(/^\?/, ""));
  let reportProps = { ...props };
  let queryProps = {};
  if (options.taxonomy) {
    queryProps = { taxonomy: options.taxonomy };
  }
  if (!props.report) {
    return null;
  }
  queryProps.report = props.report;
  queryProps.disableModal = props.disableModal;
  if (!props.result) {
    reportProps.result = "taxon";
    queryProps.result = "taxon";
  }
  if (!props.queryString) {
    queryPropList.forEach((prop) => {
      if (props.hasOwnProperty(prop)) {
        queryProps[prop] = props[prop];
      }
    });
    reportProps.queryString = qs.stringify(queryProps);
  }
  if (!props.reportId) {
    reportProps.reportId = reportProps.queryString;
  }
  reportProps.inModal = props.inModal;
  reportProps.chartRef = props.chartRef;
  reportProps.delay = props.delay;
  reportProps.containerRef = props.containerRef;
  reportProps.topLevel = props.topLevel;
  reportProps.ratio = props.ratio || 1;
  reportProps.stacked = props.stacked;
  reportProps.cumulative = props.cumulative;
  reportProps.yScale = props.yScale || "linear";
  reportProps.zScale = props.yScale || "linear";
  reportProps.xOpts = props.xOpts;
  reportProps.yOpts = props.yOpts;
  reportProps.scatterThreshold = props.scatterThreshold;

  return <ReportItem {...reportProps} />;
};

export default Report;
