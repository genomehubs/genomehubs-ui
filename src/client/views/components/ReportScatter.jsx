// import { RadialChart } from "react-vis";
import {
  CartesianGrid,
  Label,
  Legend,
  Rectangle,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import React, { useRef, useState } from "react";
import { scaleLinear, scaleLog, scaleSqrt } from "d3-scale";
import { useLocation, useNavigate } from "@reach/router";

import CellInfo from "./CellInfo";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import { format } from "d3-format";
import formats from "../functions/formats";
import { point } from "leaflet";
import qs from "qs";
import styles from "./Styles.scss";
import useResize from "../hooks/useResize";

const COLORS = [
  "#1f78b4",
  "#33a02c",
  "#e31a1c",
  "#ff7f00",
  "#6a3d9a",
  "#a6cee3",
  "#b2df8a",
  "#fb9a99",
  "#fdbf6f",
  "#cab2d6",
];

// const CustomShape = (props, chartProps) => {
//   let h = props.yAxis.height / chartProps.yLength;
//   let w = props.xAxis.width / chartProps.xLength;
//   console.log(props);
//   return (
//     <Rectangle
//       {...props}
//       height={h}
//       width={w}
//       mask={`url(#mask-stripe-${chartProps.n}-${chartProps.i})`}
//       fill={props.fill}
//       x={props.cx}
//       y={props.cy - h}
//       fillOpacity={props.zAxis.scale(props.payload.z)}
//     />
//   );
// };

const scales = {
  linear: scaleLinear,
  log10: scaleLog,
  sqrt: scaleSqrt,
  proportion: scaleLinear,
};

const searchByCell = ({
  xQuery,
  yQuery,
  xLabel,
  yLabel,
  xBounds,
  yBounds,
  navigate,
  location,
  fields,
  ranks,
  valueType,
  yValueType,
}) => {
  let query = xQuery.query;
  query = query
    .replaceAll(new RegExp("AND\\s+" + xLabel + "\\s+AND", "gi"), "AND")
    .replaceAll(
      new RegExp("AND\\s+" + xLabel + "\\s+>=\\s*[\\w\\d_]+", "gi"),
      ""
    )
    .replaceAll(
      new RegExp("AND\\s+" + xLabel + "\\s+<\\s*[\\w\\d_]+", "gi"),
      ""
    )
    .replaceAll(/\s+/g, " ")
    .replace(/\s+$/, "");
  if (valueType == "date") {
    query += ` AND ${xLabel} >= ${new Date(
      xBounds[0]
    ).toISOString()} AND ${xLabel} < ${new Date(xBounds[1]).toISOString()}`;
  } else {
    query += ` AND ${xLabel} >= ${xBounds[0]} AND ${xLabel} < ${xBounds[1]}`;
  }
  if (yValueType == "date") {
    query += ` AND ${yLabel} >= ${new Date(
      yBounds[0]
    ).toISOString()} AND ${yLabel} < ${new Date(yBounds[1]).toISOString()}`;
  } else {
    query += ` AND ${yLabel} >= ${yBounds[0]} AND ${yLabel} < ${yBounds[1]}`;
  }

  // let fields = `${xLabel},${yLabel}`;
  fields = fields.join(",");
  if (ranks) {
    ranks = ranks.join(",");
  }
  let options = qs.parse(location.search);
  let queryString = qs.stringify({
    ...xQuery,
    ...options,
    query,
    y: yQuery.query,
    fields,
    report: "scatter",
    ranks,
  });
  // let hash = encodeURIComponent(query);
  navigate(`/search?${queryString}#${encodeURIComponent(query)}`);
};

const CustomShape = (props, chartProps) => {
  let h = props.yAxis.height / chartProps.yLength;
  if (chartProps.yValueType == "date") {
    h =
      props.yAxis.scale(props.payload.y) -
      props.yAxis.scale(props.payload.yBound);
  }
  let height = h / chartProps.n;
  let w = props.xAxis.width / chartProps.xLength;
  if (chartProps.valueType == "date") {
    w =
      props.xAxis.scale(props.payload.xBound) -
      props.xAxis.scale(props.payload.x);
  }
  let heatRect;
  let xRange = `${chartProps.xFormat(props.payload.x)}-${chartProps.xFormat(
    props.payload.xBound
  )}`;
  let yRange = `${chartProps.yFormat(props.payload.y)}-${chartProps.yFormat(
    props.payload.yBound
  )}`;
  let bgRect = (
    <>
      <Tooltip
        title={<CellInfo x={xRange} y={yRange} count={props.payload.count} />}
        arrow
      >
        <Rectangle
          height={h}
          width={w}
          x={props.cx}
          y={props.cy - h}
          style={{ cursor: "pointer" }}
          fill={"rgba(255,255,255,0)"}
          onClick={() =>
            searchByCell({
              ...chartProps,
              xBounds: [props.payload.x, props.payload.xBound],
              yBounds: [props.payload.y, props.payload.yBound],
            })
          }
        />
      </Tooltip>
    </>
  );
  if (!chartProps.hasRawData) {
    let z = props.payload.z;
    let scale = scales[chartProps.zScale]();
    let domain = [1, chartProps.zDomain[1]];
    scale.domain(domain).range([2, w]);
    if (chartProps.n == 1) {
      scale.range([0.1, 1]);
    } else if (chartProps.zScale == "proportion") {
      scale.domain([0, 1]).range([0, w]);
      z /= chartProps.catSums[props.name];
    }
    let width = scale(z);
    heatRect = (
      <Rectangle
        {...props}
        height={chartProps.n > 1 ? height : h}
        width={chartProps.n > 1 ? width : w}
        // mask={`url(#mask-stripe-${chartProps.n}-${chartProps.i})`}
        fill={props.fill}
        x={props.cx} // {props.cx + (w - width) / 2}
        y={
          chartProps.n > 1 ? props.cy - h + height * chartProps.i : props.cy - h
        }
        // fillOpacity={chartProps.n > 1 ? 1 : props.zAxis.scale(props.payload.z)}
        fillOpacity={chartProps.n > 1 ? 1 : scale(props.payload.z)}
        style={{ pointerEvents: "none" }}
      />
    );
  }

  return (
    <>
      {bgRect}
      {heatRect}
    </>
  );
};

const Heatmap = ({
  data,
  pointData,
  width,
  height,
  cats,
  buckets,
  yBuckets,
  chartProps,
  endLabel,
  lastIndex,
  xLabel,
  yLabel,
  stacked,
}) => {
  let axes = [
    <CartesianGrid strokeDasharray="3 3" />,
    <XAxis
      type="number"
      dataKey="x"
      scale="log"
      angle={buckets.length > 15 ? -90 : 0}
      domain={[buckets[0], buckets[buckets.length - 1]]}
      range={[buckets[0], buckets[buckets.length - 1]]}
      ticks={buckets}
      tickFormatter={chartProps.xFormat}
      interval={0}
      style={{ textAnchor: buckets.length > 15 ? "end" : "auto" }}
    >
      <Label
        value={xLabel}
        offset={buckets.length > 15 ? 20 : 0}
        position="bottom"
        fill="#666"
      />
    </XAxis>,
    <YAxis
      type="number"
      dataKey="y"
      scale="log"
      ticks={yBuckets}
      domain={[yBuckets[0], yBuckets[yBuckets.length - 1]]}
      range={[yBuckets[0], yBuckets[yBuckets.length - 1]]}
      tickFormatter={chartProps.yFormat}
      interval={0}
    >
      <Label
        value={yLabel}
        offset={0}
        position="left"
        fill="#666"
        angle={-90}
        style={{ textAnchor: "middle" }}
      />
    </YAxis>,
    <ZAxis
      id={0}
      type="number"
      dataKey="count"
      domain={[chartProps.zDomain[0], chartProps.zDomain[1]]}
      range={[0.1, 1]}
      scale="sqrt"
    ></ZAxis>,
    // <Tooltip />,
  ];
  if (width > 300) {
    axes.push(<Legend verticalAlign="top" offset={28} height={28} />);
  }

  // let stripe = 4;
  // let angle = 90;
  // const patterns = (
  //   <defs>
  //     {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
  //       <>
  //         {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
  //           <>
  //             <pattern
  //               id={`pattern-stripe-${i}-${j}`}
  //               width={i * stripe}
  //               height={i * stripe}
  //               patternUnits="userSpaceOnUse"
  //               patternTransform={`rotate(${angle}) translate(${stripe * j})`}
  //             >
  //               <rect
  //                 width={stripe}
  //                 height={i * stripe}
  //                 transform="translate(0,0)"
  //                 fill="white"
  //               ></rect>
  //             </pattern>
  //             <mask id={`mask-stripe-${i}-${j}`}>
  //               <rect
  //                 x="0"
  //                 y="0"
  //                 width="100%"
  //                 height="100%"
  //                 fill={`url(#pattern-stripe-${i}-${j})`}
  //               />
  //             </mask>
  //           </>
  //         ))}
  //       </>
  //     ))}
  //   </defs>
  // );
  return (
    <ScatterChart
      width={width}
      height={height}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: width > 300 ? (buckets.length > 15 ? 35 : 25) : 5,
      }}
    >
      {/* {patterns} */}
      {axes}
      {cats.map((cat, i) => (
        <Scatter
          name={cat}
          data={data[i]}
          fill={COLORS[i]}
          shape={(props) => CustomShape(props, { ...chartProps, i })}
          isAnimationActive={false}
        />
      ))}
      {pointData &&
        cats.map((cat, i) => (
          <Scatter
            name={`${cat}_points`}
            legendType="none"
            data={pointData[i]}
            fill={COLORS[i]}
            shape={"circle"}
            zAxisId={1}
            isAnimationActive={false}
            style={{ pointerEvents: "none" }}
          />
        ))}
    </ScatterChart>
  );
};

const ReportScatter = ({
  scatter,
  chartRef,
  containerRef,
  ratio,
  zScale = "linear",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
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
  if (scatter && scatter.status) {
    let chart;
    let {
      cats,
      catSums,
      chartData,
      histograms: heatmaps,
      pointData,
    } = scatter.report.scatter;
    if (!heatmaps) {
      return null;
    }
    let hasRawData = pointData && pointData.length > 0;
    let xLabel = scatter.report.xLabel;
    let yLabel = scatter.report.yLabel;
    let valueType = heatmaps.valueType;
    let yValueType = heatmaps.yValueType || "integer";
    let lastIndex = heatmaps.buckets.length - 2;
    let endLabel = formats(heatmaps.buckets[lastIndex + 1], valueType);
    chart = (
      <Heatmap
        data={chartData}
        pointData={1 ? pointData : []}
        width={width}
        height={minDim}
        buckets={heatmaps.buckets}
        yBuckets={heatmaps.yBuckets}
        cats={cats}
        xLabel={xLabel}
        yLabel={yLabel}
        endLabel={endLabel}
        lastIndex={lastIndex}
        chartProps={{
          zDomain: heatmaps.zDomain,
          yLength: heatmaps.yBuckets.length - 1,
          xLength: heatmaps.buckets.length - 1,
          n: cats.length,
          zScale: zScale,
          catSums,
          xQuery: scatter.report.xQuery,
          yQuery: scatter.report.yQuery,
          xLabel: scatter.report.xLabel,
          yLabel: scatter.report.yLabel,
          xFormat: (value) => formats(value, valueType),
          yFormat: (value) => formats(value, yValueType),
          fields: heatmaps.fields,
          ranks: heatmaps.ranks,
          valueType,
          yValueType,
          hasRawData,
          navigate,
          location,
        }}
      />
    );
    return (
      <Grid item xs ref={componentRef} style={{ height: "100%" }}>
        {chart}
      </Grid>
    );
  } else {
    return null;
  }
};

export default ReportScatter;
