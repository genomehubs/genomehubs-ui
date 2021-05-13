import React, { useEffect, useRef, Fragment } from "react";

import qs from "qs";
import ReportItem from "./ReportItem";

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
  const reportRef = useRef();
  let reportProps = { ...props };
  let queryProps = {};
  if (!props.report) {
    return null;
  }
  queryProps.report = props.report;
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

  return <ReportItem {...reportProps} />;
};

export default Report;
