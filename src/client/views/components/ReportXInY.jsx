import React, { Fragment, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import useResize from "../hooks/useResize";
// import { RadialChart } from "react-vis";
import {
  Label,
  PieChart,
  Pie,
  Sector,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "d3-format";
import styles from "./Styles.scss";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const pct = format(".0%");
const pct1 = format(".1%");

const PieComponent = ({ data, height, width }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={"middle"}
        dominantBaseline="central"
        fontSize={innerRadius / 4}
      >
        {`${pct(percent)}`}
      </text>
    );
  };

  const CustomLabel = ({ viewBox, value1, value2, value3 }) => {
    const { cx, cy, innerRadius } = viewBox;
    return (
      <g>
        <text
          x={cx}
          y={cy + innerRadius / 20}
          fill={"#3d405c"}
          className="recharts-text recharts-label"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={innerRadius / 2.5}
        >
          {value1}
        </text>
        <text
          x={cx}
          y={cy + innerRadius / 5}
          fill="#3d405c"
          className="recharts-text recharts-label"
          textAnchor="middle"
          alignmentBaseline="hanging"
          fontSize={innerRadius / 4.5}
        >
          <tspan alignmentBaseline="hanging" fill={COLORS[0]}>
            {value2.toLocaleString()}
          </tspan>
          <tspan alignmentBaseline="hanging">
            {" "}
            / {value3.toLocaleString()}
          </tspan>
        </text>
      </g>
    );
  };

  const xValue = data[0].value;
  const yValue = data[1].value;
  const ratio = pct1(xValue / (xValue + yValue));

  return (
    // <ResponsiveContainer width={width} height={height}>
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel}
        innerRadius={Math.floor(width / 4)}
        outerRadius={Math.floor(width / 2)}
        fill="#8884d8"
        dataKey="value"
        startAngle={90}
        endAngle={-270}
        isAnimationActive={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        <Label
          width={30}
          position="center"
          content={
            <CustomLabel
              value1={ratio}
              value2={xValue}
              value3={xValue + yValue}
            />
          }
        ></Label>
      </Pie>

      {/* <text x="50%" y="50%" dy={8} textAnchor="middle" fill={"blue"}>
        {pct(data[0].value / data[1].value)}
      </text> */}
    </PieChart>

    // </ResponsiveContainer>
  );
};

const RadialBarComponent = ({ data, height, width }) => {
  console.log(data);
  return (
    <RadialBarChart
      width={width}
      height={height}
      cx="50%"
      cy="50%"
      innerRadius={Math.floor(width / 20)}
      outerRadius={Math.floor(width / 2)}
      startAngle={90}
      endAngle={-270}
      data={data}
    >
      <RadialBar
        minAngle={15}
        label={{ position: "insideStart", fill: "#fff" }}
        background
        clockWise={false}
        dataKey="uv"
        isAnimationActive={false}
      />
      {/* <Legend
        iconSize={10}
        layout="vertical"
        verticalAlign="middle"
        wrapperStyle={style}
      /> */}
    </RadialBarChart>
  );
};

const ReportXInY = ({ xInY }) => {
  const componentRef = useRef();
  const { width, height } = useResize(componentRef);
  if (xInY && xInY.status) {
    let chartData = [];
    let chart;
    if (Array.isArray(xInY.report)) {
      xInY.report.forEach((report, i) => {
        let { x, y, rank } = report;
        chartData.push({
          uv: x / y,
          pv: 1,
          name: rank,
          fill: COLORS[i % COLORS.length],
        });
      });
      chart = (
        <RadialBarComponent
          data={chartData}
          width={Math.floor(width)}
          height={Math.floor(width)}
        />
      );
    } else {
      let { x, y, xTerm, yTerm } = xInY.report;
      chartData = [
        { value: x, name: xTerm },
        { value: y - x, name: yTerm },
      ];
      chart = (
        <PieComponent
          data={chartData}
          width={Math.floor(width)}
          height={Math.floor(width)}
        />
      );
    }
    return (
      <Grid item xs ref={componentRef}>
        {/* <RadialChart
          data={chartData}
          height={300}
          width={300}
          radius={100}
          innerRadius={50}
          showLabels={true}
        /> */}
        {chart}
      </Grid>
    );
  } else {
    return null;
  }
};

export default ReportXInY;
