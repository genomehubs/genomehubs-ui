// import { RadialChart } from "react-vis";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import React, { Fragment, useRef } from "react";

import CellInfo from "./CellInfo";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import formats from "../functions/formats";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import useResize from "../hooks/useResize";

const COLORS = [
  "#a6cee3",
  "#b2df8a",
  "#fb9a99",
  "#fdbf6f",
  "#cab2d6",
  "#1f78b4",
  "#33a02c",
  "#e31a1c",
  "#ff7f00",
  "#6a3d9a",
];

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

const searchByCell = ({ xQuery, xLabel, xBounds, navigate, fields, ranks }) => {
  let query = xQuery.query;
  query += ` AND ${xLabel} >= ${xBounds[0]} AND ${xLabel} < ${xBounds[1]}`;
  // let fields = `${xLabel},${yLabel}`;
  fields = fields.join(",");
  if (ranks) {
    ranks = ranks.join(",");
  }
  let queryString = qs.stringify({ ...xQuery, query, fields, ranks });
  // let hash = encodeURIComponent(query);
  navigate(`/search?${queryString}`);
};

const CustomBackground = ({ chartProps, ...props }) => {
  if (chartProps.i > 0) {
    return null;
  }
  // console.log(props);
  let h = props.background.height;
  let w = props.width * chartProps.n;
  let xBounds = [
    chartProps.buckets[props.index],
    chartProps.buckets[props.index + 1],
  ];
  let xRange = `${chartProps.xFormat(xBounds[0])}-${chartProps.xFormat(
    xBounds[1]
  )}`;

  let { x, ...counts } = props.payload;
  let count = 0;
  let series = [];
  Object.keys(counts).forEach((key, i) => {
    if (counts[key] > 0) {
      count += counts[key];
      series.push(
        <div key={key}>
          {key}: {counts[key]}
        </div>
      );
    }
  });
  return (
    <>
      <Tooltip
        title={<CellInfo x={xRange} count={count} rows={series} />}
        arrow
      >
        <Rectangle
          height={h}
          width={w}
          x={props.background.x}
          y={props.background.y}
          style={{ cursor: "pointer" }}
          fill={"rgba(255,255,255,0)"}
          onClick={() =>
            searchByCell({
              ...chartProps,
              xBounds,
            })
          }
        />
      </Tooltip>
    </>
  );
};

const Histogram = ({
  data,
  width,
  height,
  cats,
  endLabel,
  lastIndex,
  xLabel,
  yLabel,
  stacked,
  cumulative,
  chartProps,
}) => {
  let axes = [
    <CartesianGrid strokeDasharray="3 3" vertical={false} />,
    <XAxis
      xAxisId={0}
      dataKey="x"
      interval={0}
      tickLine={false}
      tick={(props) =>
        renderXTick({ ...props, endLabel, lastIndex, chartWidth: width })
      }
    >
      {width > 300 && (
        <Label value={xLabel} offset={5} position="bottom" fill="#666" />
      )}
    </XAxis>,
    <XAxis xAxisId={1} dataKey="x" hide={true}></XAxis>,
    <YAxis>
      {width > 300 && (
        <Label
          value={yLabel}
          offset={-10}
          position="left"
          fill="#666"
          angle={-90}
          style={{ textAnchor: "middle" }}
        />
      )}
    </YAxis>,
    // <Tooltip />,
  ];
  if (width > 300) {
    axes.push(<Legend verticalAlign="top" offset={28} height={28} />);
  }
  // return (
  //   <AreaChart
  //     width={width}
  //     height={height}
  //     data={data}
  //     margin={{
  //       top: 5,
  //       right: 30,
  //       left: 20,
  //       bottom: width > 300 ? 25 : 5,
  //     }}
  //   >
  //     {axes}
  //     {cats.map((cat, i) => (
  //       <Area
  //         type={"monotone"}
  //         dataKey={cat}
  //         stroke={COLORS[i]}
  //         fill={COLORS[i]}
  //         stackId="1"
  //         isAnimationActive={false}
  //       />
  //     ))}
  //   </AreaChart>
  // );
  return (
    <BarChart
      width={width}
      height={height}
      barGap={0}
      barCategoryGap={0}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: width > 300 ? 25 : 5,
      }}
    >
      {axes}
      {cats.map((cat, i) => (
        <Bar
          dataKey={cat}
          xAxisId={1}
          legendType={"none"}
          isAnimationActive={false}
          shape={
            <CustomBackground
              chartProps={{
                ...chartProps,
                i,
              }}
            />
          }
        />
      ))}
      {cats.map((cat, i) => (
        <Bar
          dataKey={cat}
          stackId={stacked ? 1 : false}
          fill={COLORS[i]}
          isAnimationActive={false}
          style={{ pointerEvents: "none" }}
        />
      ))}
    </BarChart>
  );
};

const scales = {
  linear: (value, total) => value,
  sqrt: (value, total) => formats(Math.sqrt(value), "float"),
  log10: (value, total) =>
    value > 0 ? formats(Math.log10(value), "float") : 0,
  proportion: (value, total) =>
    total > 0 ? formats(value / total, "float") : 0,
};

const ReportHistogram = ({
  histogram,
  chartRef,
  containerRef,
  ratio,
  stacked,
  cumulative,
  yScale = "linear",
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
  if (histogram && histogram.status) {
    let chartData = [];
    let chart;
    let histograms = histogram.report.histogram.histograms;
    if (!histograms) {
      return null;
    }
    let xLabel = histogram.report.xLabel;
    let yLabel = histogram.report.yLabel;
    let valueType = histograms.valueType;
    if (yScale == "log10") {
      yLabel = `Log10 ${yLabel}`;
    } else if (yScale == "proportion") {
      yLabel = `Proportional ${yLabel}`;
    }
    let cats;
    let lastIndex = histograms.buckets.length - 2;
    let endLabel = formats(histograms.buckets[lastIndex + 1], valueType);
    if (histograms.byCat) {
      cats = histogram.report.histogram.cats.map((cat) => cat.label);
      let sums = {};
      histograms.buckets.forEach((bucket, i) => {
        if (i < histograms.buckets.length - 1) {
          let series = {};
          histogram.report.histogram.cats.forEach((cat) => {
            let value = histograms.byCat[cat.key][i];
            if (cumulative) {
              if (!sums[cat.key]) {
                sums[cat.key] = 0;
              }
              value += sums[cat.key];
              sums[cat.key] = value;
            }

            series[cat.label] = scales[yScale](
              value,
              stacked ? histogram.report.histogram.x : cat.doc_count
            );
          });
          chartData.push({
            x: formats(bucket, valueType),
            ...series,
          });
        }
      });
    } else {
      cats = ["all taxa"];
      let sum = 0;
      histograms.buckets.forEach((bucket, i) => {
        if (i < histograms.buckets.length - 1) {
          let value = histograms.allValues[i];
          if (cumulative) {
            value += sum;
            sum = value;
          }
          chartData.push({
            x: formats(bucket, valueType),
            "all taxa": scales[yScale](value, histogram.report.histogram.x),
          });
        }
      });
    }

    chart = (
      <Histogram
        data={chartData}
        width={width}
        height={minDim}
        cats={cats}
        xLabel={xLabel}
        yLabel={yLabel}
        endLabel={endLabel}
        lastIndex={lastIndex}
        stacked={stacked}
        chartProps={{
          zDomain: histograms.zDomain,
          xLength: histograms.buckets.length - 1,
          n: cats.length,
          yScale: yScale,
          xQuery: histogram.report.xQuery,
          xLabel: histogram.report.xLabel,
          fields: histograms.fields,
          ranks: histograms.ranks,
          buckets: histograms.buckets,
          xFormat: (value) => formats(value, valueType),
          navigate,
        }}
      />
    );
    //   { value: x, name: xTerm },
    //   { value: y - x, name: yTerm },
    // ];
    // let { x, y, xTerm, yTerm } = xInY.report.xInY;
    // chartData = [
    //   { value: x, name: xTerm },
    //   { value: y - x, name: yTerm },
    // ];
    // chart = <PieComponent data={chartData} width={minDim} height={minDim} />;

    return (
      <Grid item xs ref={componentRef} style={{ height: "100%" }}>
        {chart}
      </Grid>
    );
  } else {
    return null;
  }
};

export default ReportHistogram;
