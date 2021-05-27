// import { RadialChart } from "react-vis";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { Fragment, useRef } from "react";

import Grid from "@material-ui/core/Grid";
import { format } from "d3-format";
import styles from "./Styles.scss";
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
const sci = format(".3s");

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

const Histogram = ({
  data,
  width,
  height,
  cats,
  endLabel,
  lastIndex,
  xLabel,
  yLabel,
}) => {
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
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis
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
      </XAxis>
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
      </YAxis>
      <Tooltip />
      {width > 300 && <Legend verticalAlign="top" offset={28} height={28} />}
      {cats.map((cat, i) => (
        <Bar dataKey={cat} fill={COLORS[i]} isAnimationActive={false} />
      ))}
    </BarChart>
  );
};

const ReportHistogram = ({ histogram, chartRef, containerRef, ratio }) => {
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
    let xLabel = histogram.report.xLabel;
    let yLabel = histogram.report.yLabel;
    let cats;
    let lastIndex = histograms.buckets.length - 2;
    let endLabel = sci(histograms.buckets[lastIndex + 1]);
    if (histograms.byCat) {
      cats = histogram.report.histogram.cats.map((cat) => cat.label);
      histograms.buckets.forEach((bucket, i) => {
        if (i < histograms.buckets.length - 1) {
          let series = {};
          histogram.report.histogram.cats.forEach((cat) => {
            series[cat.label] = histograms.byCat[cat.key][i];
          });
          chartData.push({
            x: sci(bucket),
            ...series,
          });
        }
      });
    } else {
      cats = ["all taxa"];
      histograms.buckets.forEach((bucket, i) => {
        if (i < histograms.buckets.length - 1) {
          chartData.push({
            x: sci(bucket),
            "all taxa": histograms.allValues[i],
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