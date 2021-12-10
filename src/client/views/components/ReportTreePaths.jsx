import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import React, { useCallback, useEffect, useRef, useState } from "react";

import KonvaTooltip from "./KonvaTooltip";
import Skeleton from "@material-ui/lab/Skeleton";
import classnames from "classnames";
import { compose } from "recompose";
import { scaleLinear } from "d3-scale";
import styles from "./Styles.scss";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import withTypes from "../hocs/withTypes";

const ReportTreePaths = ({
  // root_id,
  // rootNode,
  // setRootNode,
  types,
  // treeRings,
  // searchTerm,
  // searchResults,
  // fetchNodes,
  // treeHighlight,
  // setTreeHighlight,
  // treeQuery,
  // setTreeQuery,
  // newickString,
  count,
  lines,
  // labels,
  handleNavigation,
  handleSearch,
  width,
  height,
  plotHeight,
  maxWidth,
  hidePreview,
  reportRef,
  gridRef,
}) => {
  if (!lines || lines.length == 0) {
    return null;
  }

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );

  let divHeight = height;
  let divWidth = width;
  height = plotHeight;

  const [highlight, setHighlight] = useState();
  const [tooltip, setTooltip] = useState({});
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const [scale, setScale] = useState(
    divWidth ? divWidth / (maxWidth || divWidth) : 1
  );
  const padding = 500;
  let previewScale = 1;
  let previewWidth = maxWidth;
  let previewHeight = plotHeight;
  let previewRatio = 1;
  let previewDivHeight = divHeight;

  const scrollContainerRef = useRef(null);
  const stageRef = useRef(null);
  const previewRef = useRef(null);
  let maxY = plotHeight - divHeight + 10;
  let yScale = scaleLinear();
  let previewYScale = scaleLinear();
  let globalYScale = scaleLinear();

  useEffect(() => {
    setScale(divWidth ? divWidth / (maxWidth || divWidth) : 1);
  }, [maxWidth, divWidth]);

  // Element scroll position
  useScrollPosition(
    ({ currPos }) => {
      let y = Math.min(currPos.y / scale, maxY);
      // if (plotHeight > previewHeight) {
      let previewY = 0;
      previewY = yScale(currPos.y / scale);
      setPreviewOffset({
        x: previewOffset.x,
        y: previewY,
      });
      // }
      setScrollPosition({
        x: currPos.x,
        y,
      });
    },
    [],
    stageRef,
    false,
    100,
    scrollContainerRef
  );

  const handleDragStart = () => {};
  const handleDragMove = (event, limit) => {
    event.target.x(0);
    if (limit) {
      event.target.y(Math.max(0, Math.min(event.target.y(), limit)));
    }
  };
  const handleDragEnd = (event) => {
    let x = scrollPosition.x;
    let y = event.target.y() * scale;
    setScrollPosition({
      x,
      y,
    });
    scrollContainerRef.current.scrollLeft = x;
    scrollContainerRef.current.scrollTop = y;
  };

  const handleGlobalDragEnd = (event, limit) => {
    let x = scrollPosition.x;
    let y = event.target.y();
    if (limit) {
      event.target.y(Math.max(0, Math.min(event.target.y(), limit)));
    }
    y = globalYScale.invert(y) * scale;
    setScrollPosition({
      x,
      y,
    });
    scrollContainerRef.current.scrollLeft = x;
    scrollContainerRef.current.scrollTop = y;
  };

  const handlePreviewClick = ({ evt, target }) => {
    const stage = target.getStage();
    const offset = { x: stage.x(), y: stage.y() };
    let x = scrollPosition.x;
    let y = evt.layerY - offset.y;
    y = previewYScale(y) * scale;
    y = Math.max(Math.min(y, maxY * scale), 0);
    setScrollPosition({
      x,
      y,
    });
    scrollContainerRef.current.scrollLeft = x;
    scrollContainerRef.current.scrollTop = y;
  };

  // const anchorRef = useRef(null);
  const treeRef = useRef(null);
  const [treeDimensions, setTreeDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const getDimensions = (myRef) => {
    return treeDimensions;
    myRef.current ? myRef.current.getBBox() : treeDimensions;
  };
  useEffect(() => {
    if (treeRef.current) {
      let dimensions = getDimensions(treeRef);
      setTreeDimensions(dimensions);
      // setScale(divWidth / (maxWidth || divWidth));
    }
    if (stageRef.current) {
      setScrollBarWidth(
        stageRef.current.offsetWidth - stageRef.current.clientWidth
      );
    }
  }, [treeRef, stageRef]);

  const showTooltip = (e, segment) => {
    if (segment) {
      const container = e.target.getStage().container();
      container.style.cursor = "pointer";
    } else {
      const container = e.target.getStage().container();
      container.style.cursor = "default";
    }
    setTooltip({ e, segment });
  };

  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [labels, setLabels] = useState([]);
  const [regions, setRegions] = useState([]);
  const [overview, setOverview] = useState([]);
  const [portion, setPortion] = useState(0);
  const updateCache = (index, value) => {
    const updatedCache = [...portionCache];
    updatedCache[index] = value;
    setPortionCache(updatedCache);
  };
  const [portionCache, setPortionCache] = useState([]);

  const overviewWidth = 10;
  const overviewHeight = divHeight;
  const overviewScale = scaleLinear()
    .domain([10, plotHeight - 10])
    .range([0, overviewHeight]);
  const portionHeight = 10000;
  const portionOverlap = 10000;

  useEffect(() => {
    let visiblePortion = Math.floor(
      Math.max(0, scrollPosition.y) / portionHeight
    );
    if (visiblePortion != portion) {
      setPortion(visiblePortion);
    }
  }, [scrollPosition.y]);

  let mouseDownTimeout;

  useEffect(() => {
    if (lines) {
      let newPaths = [];
      let newNodes = [];
      let newLabels = [];
      let newRegions = [];
      let newOverview = [];
      if (portionCache[portion]) {
        ({ newNodes, newPaths, newLabels, newRegions } = portionCache[portion]);
      } else {
        let lowerY = portionHeight * portion - portionOverlap;
        let upperY = portionHeight * (portion + 1) + portionOverlap;
        for (let segment of lines) {
          if (overview.length == 0 && segment.tip && segment.status == 1) {
            let oveviewY = overviewScale(segment.yStart);
            newOverview.push(
              <Line
                key={`o-${segment.taxon_id}`}
                points={[4, oveviewY, overviewWidth, oveviewY]}
                stroke={segment.color}
                opacity={0.5}
              />
            );
          }
          if (segment.yMin > upperY || segment.yMax < lowerY) {
            continue;
          }
          newPaths.push(
            <Line
              key={`h-${segment.taxon_id}`}
              points={[
                segment.xStart,
                segment.yStart,
                segment.xEnd,
                segment.yStart,
              ]}
              stroke={segment.color}
            />
          );
          if (segment.scientific_name == "parent") {
            newPaths.push(
              <Line
                key={`v-${segment.taxon_id}`}
                points={[
                  segment.xStart + 10,
                  segment.yMin,
                  segment.xStart,
                  segment.yStart,
                  segment.xStart + 10,
                  segment.yMax,
                ]}
                stroke={segment.color}
              />
            );
          } else if (segment.vLine) {
            newPaths.push(
              <Line
                key={`v-${segment.taxon_id}`}
                points={[
                  segment.xEnd,
                  segment.yMin,
                  segment.xEnd,
                  segment.yMax,
                ]}
                stroke={segment.color}
              />
            );
          }
          newRegions.push(
            <Rect
              key={`r-${segment.taxon_id}`}
              x={segment.xStart}
              y={segment.yMin}
              width={
                segment.tip ? segment.labelWidth + segment.width : segment.width
              }
              height={segment.height}
              fill={"rgba(0,0,0,0)"}
              onMouseEnter={(e) => showTooltip(e, segment)}
              onTouchStart={(e) => showTooltip(e, segment)}
              onMouseMove={(e) => showTooltip(e, segment)}
              onTouchMove={(e) => showTooltip(e, segment)}
              onMouseLeave={(e) => showTooltip(e)}
              onTouchEnd={(e) => showTooltip(e)}
              onMouseDown={(e) => {
                mouseDownTimeout = setTimeout(() => {
                  handleSearch({
                    root: segment.taxon_id,
                    name: segment.scientific_name,
                    depth: segment.depth,
                  });
                }, 500);
              }}
              onMouseUp={() => {
                clearTimeout(mouseDownTimeout);
                handleNavigation({
                  root: segment.taxon_id,
                  name: segment.scientific_name,
                  depth: segment.depth,
                });
              }}
            />
          );
          if (
            segment.scientific_name == "parent" ||
            (!segment.tip && segment.childCount == 1)
          ) {
            newNodes.push(
              <Circle
                x={segment.xEnd}
                y={segment.yStart}
                radius={4}
                fill="white"
                stroke={segment.color}
                key={`c-${segment.taxon_id}`}
              />
            );
          }

          {
            segment.label &&
              newLabels.push(
                <Text
                  key={`t-${segment.taxon_id}`}
                  text={segment.label}
                  fontSize={10}
                  x={segment.tip ? segment.xEnd + 10 : segment.xStart - 6}
                  y={segment.tip ? segment.yMin : segment.yStart - 11}
                  width={segment.tip ? segment.labelWidth : segment.width}
                  height={segment.height}
                  fill={segment.color}
                  align={segment.tip ? "left" : "right"}
                  verticalAlign={segment.tip ? "middle" : "top"}
                />
              );
          }
        }
        updateCache(portion, { newNodes, newPaths, newLabels, newRegions });
      }

      setNodes(newNodes);
      setPaths(newPaths);
      setLabels(newLabels);
      setRegions(newRegions);
      if (newOverview.length > 0) {
        setOverview(newOverview);
      }
    }
  }, [lines, portion]);

  let index = "";
  css = undefined;
  previewHeight = Math.min(10000, plotHeight);
  previewRatio = previewHeight / plotHeight;
  previewScale = divHeight / previewHeight;
  previewWidth = previewScale * divWidth;
  if (previewWidth > divWidth / 8) {
    previewWidth = divWidth / 8 / scale;
    previewScale = previewWidth / divWidth;
    previewDivHeight = previewScale * previewHeight;
  }

  yScale.domain([0, plotHeight - divHeight]).range([0, divHeight]);

  globalYScale
    .domain([0, plotHeight - divHeight])
    .range([0, divHeight - divHeight * previewRatio]);

  previewYScale = scaleLinear()
    .domain([0, previewDivHeight / previewRatio])
    .range([0 - divHeight / 2, plotHeight - divHeight / 2]);

  let preview;

  if (!hidePreview && plotHeight > divHeight * 1.5) {
    let globalPosition;
    if (previewHeight < plotHeight) {
      globalPosition = (
        <div
          style={{
            height: previewDivHeight,
            overflow: "hidden",
            width: overviewWidth,
            position: "absolute",
            top: 0,
            left: -overviewWidth,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              height: previewDivHeight,
              width: overviewWidth,
              position: "absolute",
              right: 0,
              pointerEvents: "auto",
            }}
          >
            <Stage
              width={overviewWidth}
              height={previewDivHeight}
              pixelRatio={1}
            >
              <Layer>
                <Group>{overview}</Group>
                <Rect
                  x={0}
                  width={overviewWidth}
                  y={globalYScale(scrollPosition.y)}
                  height={previewDivHeight * previewRatio}
                  fill={"rgba(125,125,125,0.5)"}
                  onClick={handlePreviewClick}
                  draggable
                  onDragStart={handleDragStart}
                  onDragMove={(e) =>
                    handleDragMove(
                      e,
                      divHeight - previewDivHeight * previewRatio
                    )
                  }
                  onDragEnd={(e) =>
                    handleGlobalDragEnd(
                      e,
                      divHeight - previewDivHeight * previewRatio
                    )
                  }
                />
              </Layer>
            </Stage>
          </div>
        </div>
      );
    }
    preview = (
      <div
        style={{
          height: previewDivHeight,
          overflow: "visible",
          width: previewWidth,
          position: "absolute",
          top: 0,
          left: -previewWidth,
        }}
      >
        <div
          style={{
            height: previewDivHeight,
            overflow: "hidden",
            width: previewWidth,
            position: "absolute",
            top: 0,
            right: 0,
            border: "rgba(0,0,0,0.1) solid 1px",
            borderRight: "none",
            boxSizing: "border-box",
            pointerEvents: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              height: previewDivHeight,
              width: previewWidth,
              position: "absolute",
              right: 0,
              top: 0,
            }}
            ref={previewRef}
          >
            <Stage
              width={previewWidth}
              height={previewDivHeight}
              y={previewOffset.y - previewOffset.y / previewRatio}
              scaleX={previewScale}
              scaleY={previewScale}
              style={{ pointerEvents: "auto" }}
              pixelRatio={1}
            >
              <Layer>
                {paths}
                <Rect
                  x={0}
                  width={maxWidth}
                  y={0}
                  height={plotHeight}
                  fill={"rgba(0,0,0,0)"}
                  onClick={handlePreviewClick}
                />
              </Layer>
              <Layer>
                <Rect
                  x={0}
                  width={maxWidth}
                  y={yScale.invert(previewOffset.y)}
                  height={divHeight / scale}
                  fill={"rgba(0,0,255,0.1)"}
                  draggable={true}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={(e) => handleDragEnd(e, maxY)}
                  onClick={({ evt }) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                  }}
                />
              </Layer>
            </Stage>
          </div>
        </div>
        {globalPosition}
      </div>
    );
  }

  let skeleton;
  if (plotHeight > divHeight + padding) {
    skeleton = (
      <div
        style={{
          height: divHeight,
          width: divWidth,
          position: "absolute",
          overflow: "hidden",
          top: 0,
          left: 0,
        }}
      >
        <Skeleton variant="rect" width={divWidth} height={divHeight} />
      </div>
    );
  }

  return (
    <div
      style={{
        height: divHeight,
        overflow: "visible",
        width: divWidth,
        position: "relative",
      }}
    >
      {skeleton}
      <div
        style={{
          height: divHeight,
          overflowY: "auto",
          overflowX: "hidden",
          width: divWidth,
          position: "absolute",
          border: "rgba(0,0,0,0.1) solid 1px",
          boxSizing: "border-box",
        }}
        ref={scrollContainerRef}
      >
        <div
          style={{
            height: plotHeight * scale,
            width: divWidth,
            position: "absolute",
            overflow: "hidden",
          }}
          ref={stageRef}
        >
          <div
            style={{
              height: divHeight + padding * 2,
              width: divWidth,
              top: scrollPosition.y * scale - padding,
              left: scrollPosition.x,
              overflowY: "hidden",
              position: "absolute",
            }}
          >
            <Stage
              width={divWidth}
              height={divHeight + padding * 2}
              x={-scrollPosition.x}
              y={-scrollPosition.y * scale + padding}
              scaleX={scale}
              scaleY={scale}
              pixelRatio={1}
            >
              <Layer>
                <Rect
                  x={scrollPosition.x}
                  width={divWidth / scale}
                  y={scrollPosition.y - padding}
                  height={divHeight + padding * 2}
                  fill={"white"}
                />
              </Layer>
              <Layer>{paths}</Layer>
              <Layer>
                <Group>{labels}</Group>
                <Group>{nodes}</Group>
              </Layer>
              <Layer>
                <KonvaTooltip {...tooltip} scale={scale} />
                <Group>{regions}</Group>
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      {preview}
    </div>
  );
};

export default compose(withTypes)(ReportTreePaths);
