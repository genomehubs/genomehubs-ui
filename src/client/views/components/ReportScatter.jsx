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

import Grid from "@material-ui/core/Grid";
import { format } from "d3-format";
import { scaleLinear } from "d3-scale";
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
const sci = format(".3s");
const sciInt = (v) => {
  if (v < 1000) {
    return Math.ceil(v);
  }
  return format(".3s")(v);
};
const f3 = format(".3r");

const renderXTick = (tickProps) => {
  const { x, y, index, endLabel, lastIndex, payload, chartWidth } = tickProps;
  const { value, offset } = payload;
  // if (month % 3 === 1) {
  //   return <text x={x} y={y - 4} textAnchor="middle">{`Q${quarterNo}`}</text>;
  // }

  // const isLast = month === 11;

  // if (month % 3 === 0 || isLast) {
  let endTick;
  let pathX;
  if (index == lastIndex) {
    pathX = Math.floor(x + offset) + 0.5;
    endTick = (
      <>
        <text x={pathX} y={y + 14} textAnchor="middle" fill="#666">
          {endLabel}
        </text>
        <path d={`M${pathX},${y - 8}v${6}`} stroke="#666" />
      </>
    );
  }
  pathX = Math.floor(x - offset) + 0.5;
  let showTickLabel = true;
  if (chartWidth < 300 && index > 0) {
    showTickLabel = false;
  } else if (chartWidth < 450) {
    if (endTick || index % 2 != 0) {
      showTickLabel = false;
    }
  }
  return (
    <g>
      {showTickLabel && (
        <text x={pathX} y={y + 14} textAnchor="middle" fill="#666">
          {value}
        </text>
      )}
      <path d={`M${pathX},${y - 8}v${6}`} stroke="#666" />
      {endTick}
    </g>
  );
  // }
  // return null;
};

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

const CustomShape = (props, chartProps) => {
  let h = props.yAxis.height / chartProps.yLength;
  let height = h / chartProps.n;
  let w = props.xAxis.width / chartProps.xLength;
  let scale = scaleLinear().domain(chartProps.zDomain).range([1, w]);
  let width = scale(props.payload.z);
  return (
    <Rectangle
      {...props}
      height={chartProps.n > 1 ? height : h}
      width={chartProps.n > 1 ? width : w}
      // mask={`url(#mask-stripe-${chartProps.n}-${chartProps.i})`}
      fill={props.fill}
      x={props.cx} // {props.cx + (w - width) / 2}
      y={chartProps.n > 1 ? props.cy - h + height * chartProps.i : props.cy - h}
      fillOpacity={chartProps.n > 1 ? 1 : props.zAxis.scale(props.payload.z)}
    />
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
      domain={[buckets[0], buckets[buckets.length - 1]]}
      range={[buckets[0], buckets[buckets.length - 1]]}
      ticks={buckets}
      tickFormatter={sci}
    >
      <Label value={xLabel} offset={5} position="bottom" fill="#666" />
    </XAxis>,
    <YAxis
      type="number"
      dataKey="y"
      scale="log"
      ticks={yBuckets}
      domain={[yBuckets[0], yBuckets[yBuckets.length - 1]]}
      range={[yBuckets[0], yBuckets[yBuckets.length - 1]]}
      tickFormatter={sci}
    >
      <Label
        value={yLabel}
        offset={-10}
        position="left"
        fill="#666"
        angle={-90}
        style={{ textAnchor: "middle" }}
      />
    </YAxis>,
    <ZAxis
      type="number"
      dataKey="z"
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
        bottom: width > 300 ? 25 : 5,
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

const scales = {
  linear: (value, total) => value,
  log10: (value, total) => (value > 0 ? f3(Math.log10(value)) : 0),
  proportion: (value, total) => (total > 0 ? f3(value / total) : 0),
};

const ReportScatter = ({ scatter, chartRef, containerRef, ratio, stacked }) => {
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
    console.log(scatter);
    console.log(heatmaps);
    let lastIndex = heatmaps.buckets.length - 2;
    let endLabel =
      heatmaps.valueType == "integer"
        ? sciInt(heatmaps.buckets[lastIndex + 1])
        : sci(heatmaps.buckets[lastIndex + 1]);

    let h = heatmaps.yBuckets[1] - heatmaps.yBuckets[0];
    let w = heatmaps.buckets[1] - heatmaps.buckets[0];

    if (heatmaps.byCat) {
      cats = scatter.report.histogram.cats.map((cat) => cat.label);
      scatter.report.histogram.cats.forEach((cat) => {
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
                    z,
                  });
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
                  z,
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
