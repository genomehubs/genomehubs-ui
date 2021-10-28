// import { RadialChart } from "react-vis";
import React, { Fragment, useRef } from "react";

import Grid from "@material-ui/core/Grid";
import Skeleton from "@material-ui/lab/Skeleton";
import useResize from "../hooks/useResize";

const ReportLoading = ({ report, chartRef, containerRef, ratio }) => {
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

  let skel = <Skeleton variant="rect" width={width} height={minDim} />;

  return (
    <Grid item xs ref={componentRef} style={{ height: "100%" }}>
      {skel}
    </Grid>
  );
};

export default ReportLoading;
