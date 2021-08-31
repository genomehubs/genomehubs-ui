// import { RadialChart } from "react-vis";
import {
  CartesianGrid,
  Label,
  Legend,
  Rectangle,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import React, { Fragment, useRef } from "react";
import { scaleLinear, scaleLog, scaleSqrt } from "d3-scale";

import Grid from "@material-ui/core/Grid";
import { format } from "d3-format";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
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
const sci = format(".3s");
const sciInt = (v) => {
  if (v < 1000) {
    return Math.ceil(v);
  }
  return format(".3s")(v);
};
const f3 = format(".3r");

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
  xLabel,
  yLabel,
  xBounds,
  yBounds,
  navigate,
  fields,
  ranks,
}) => {
  let query = xQuery.query;
  query += ` AND ${xLabel} >= ${xBounds[0]} AND ${xLabel} < ${xBounds[1]}`;
  query += ` AND ${yLabel} >= ${yBounds[0]} AND ${yLabel} < ${yBounds[1]}`;
  // let fields = `${xLabel},${yLabel}`;
  fields = fields.join(",");
  if (ranks) {
    ranks = ranks.join(",");
  }
  let queryString = qs.stringify({ ...xQuery, query, fields, ranks });
  navigate(`/search?${queryString}`);
};

const CustomShape = (props, chartProps) => {
  let h = props.yAxis.height / chartProps.yLength;
  let height = h / chartProps.n;
  let w = props.xAxis.width / chartProps.xLength;
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
  return (
    <>
      <Rectangle
        height={h}
        width={w}
        x={props.cx}
        y={props.cy - h}
        style={{ cursor: "pointer" }}
        fill={"rgba(255,255,255,0"}
        onClick={() =>
          searchByCell({
            ...chartProps,
            xBounds: [props.payload.x, props.payload.xBound],
            yBounds: [props.payload.y, props.payload.yBound],
          })
        }
      />
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
    </>
  );
};

const Heatmap = ({
  data,
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
      tickFormatter={sci}
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
      tickFormatter={sci}
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
      type="number"
      dataKey="count"
      domain={[chartProps.zDomain[0], chartProps.zDomain[1]]}
      range={[0.1, 1]}
      scale="sqrt"
    ></ZAxis>,
    <Tooltip />,
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
    </ScatterChart>
  );
};

const ReportScatter = ({
  scatter,
  chartRef,
  containerRef,
  ratio,
  stacked,
  zScale = "linear",
}) => {
  const navigate = useNavigate();
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
    let chartData = [];
    let chart;
    let heatmaps = scatter.report.histogram.histograms;
    if (!heatmaps) {
      return null;
    }
    let xLabel = scatter.report.xLabel;
    let yLabel = scatter.report.yLabel;
    let valueType = heatmaps.valueType;
    let cats;
    let lastIndex = heatmaps.buckets.length - 2;
    let endLabel =
      heatmaps.valueType == "integer"
        ? sciInt(heatmaps.buckets[lastIndex + 1])
        : sci(heatmaps.buckets[lastIndex + 1]);

    let h = heatmaps.yBuckets[1] - heatmaps.yBuckets[0];
    let w = heatmaps.buckets[1] - heatmaps.buckets[0];
    let catSums;
    if (heatmaps.byCat) {
      catSums = {};
      cats = scatter.report.histogram.cats.map((cat) => cat.label);
      scatter.report.histogram.cats.forEach((cat) => {
        catSums[cat.label] = 0;
        let catData = [];
        heatmaps.buckets.forEach((bucket, i) => {
          if (i < heatmaps.buckets.length - 1) {
            heatmaps.yBuckets.forEach((yBucket, j) => {
              if (j < heatmaps.yBuckets.length - 1) {
                let z = heatmaps.yValuesByCat[cat.key][i][j];
                if (z > 0) {
                  catData.push({
                    h,
                    w,
                    x: bucket,
                    y: yBucket,
                    xBound: heatmaps.buckets[i + 1],
                    yBound: heatmaps.yBuckets[j + 1],
                    z,
                    count: heatmaps.allYValues[i][j],
                  });
                  catSums[cat.label] += z;
                }
              }
            });
          }
        });
        chartData.push(catData);
      });
    } else {
      cats = ["all taxa"];
      let catData = [];
      heatmaps.buckets.forEach((bucket, i) => {
        if (i < heatmaps.buckets.length - 1) {
          heatmaps.yBuckets.forEach((yBucket, j) => {
            if (j < heatmaps.yBuckets.length - 1) {
              let z = heatmaps.allYValues[i][j];
              if (z > 0) {
                catData.push({
                  h,
                  w,
                  x: bucket,
                  y: yBucket,
                  xBound: heatmaps.buckets[i + 1],
                  yBound: heatmaps.yBuckets[j + 1],
                  z,
                  count: z,
                });
              }
            }
          });
        }
      });
      chartData.push(catData);
    }
    chart = (
      <Heatmap
        data={chartData}
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
          xLabel: scatter.report.xLabel,
          yLabel: scatter.report.yLabel,
          fields: heatmaps.fields,
          ranks: heatmaps.ranks,
          navigate,
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
