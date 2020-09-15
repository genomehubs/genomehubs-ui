import React, { useEffect } from "react";
import { compose } from "recompose";
import withSummary from "../hocs/withSummary";

const HistogramSVG = ({
  summaryId,
  sequence = 0,
  summaryById,
  fetchSummary,
}) => {
  const height = 100;
  let parts = summaryId.split("--");
  useEffect(() => {
    if (summaryId) {
      setTimeout(() => {
        fetchSummary(parts[0], parts[1], parts[2]);
      }, sequence * 100);
    }
  }, [summaryId]);
  let buckets = [];
  let ticks = [];
  if (summaryById && summaryById.buckets) {
    buckets = summaryById.buckets;
    ticks = summaryById.ticks;
  }
  let histogramRects = [];
  let histogramText = [];
  let histogramTicks = [];
  let histogramTickLabels = [];
  buckets.forEach((bucket, i) => {
    histogramRects.push(
      <rect
        key={bucket.bin}
        x={bucket.x}
        y={0}
        width={bucket.width}
        height={height}
        fill={bucket.color}
      />
    );
    histogramText.push(
      <text
        key={bucket.bin}
        style={{ fontSize: "24px" }}
        x={bucket.x + bucket.width / 2}
        y={height / 2}
        fill={"white"}
        textAnchor="middle"
        dominantBaseline="central"
        pointerEvents={"none"}
      >
        {bucket.count}
      </text>
    );
  });
  ticks.forEach((tick, i) => {
    histogramTicks.push(
      <line
        key={tick.value}
        x1={tick.x}
        y1={height}
        x2={tick.x}
        y2={height + 5}
        stroke={"currentColor"}
        strokeWidth={1}
        opacity={0.75}
      >
        {tick.value}
      </line>
    );
    histogramTickLabels.push(
      <text
        key={tick.value}
        style={{ fontSize: "14px" }}
        x={tick.x}
        y={height + 5}
        fill={"currentColor"}
        textAnchor={"middle"}
        alignmentBaseline={"hanging"}
        opacity={0.75}
      >
        {tick.value}
      </text>
    );
  });
  return (
    <svg viewBox={"-25 -10 1050 135"} preserveAspectRatio="xMinYMin">
      <g>{histogramTicks}</g>
      <g>{histogramRects}</g>
      <g>{histogramText}</g>
      <rect
        x={0}
        y={0}
        width={1000}
        height={height}
        fill={"none"}
        stroke={"black"}
        strokeWidth={1}
      />
      <g>{histogramTickLabels}</g>
    </svg>
  );
};

export default compose(withSummary)(HistogramSVG);
