import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@reach/router";

import Grid from "@material-ui/core/Grid";
import KonvaTooltip from "./KonvaTooltip";
import ReactDOM from "react-dom";
import SVGDownloadButton from "./SVGDownloadButton";
import Skeleton from "@material-ui/lab/Skeleton";
import Tooltip from "@material-ui/core/Tooltip";
import VariableFilter from "./VariableFilter";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import { scaleLinear } from "d3-scale";
import { scaleLog } from "d3-scale";
import styles from "./Styles.scss";
import { useLongPress } from "use-long-press";
import useResize from "../hooks/useResize";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withTree from "../hocs/withTree";
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
  reportRef,
  gridRef,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  if (!lines || lines.length == 0) {
    return null;
  }
  // const [highlightParams, setHighlightParams] = useState(treeHighlight);

  // if (!searchResults.status || !searchResults.status.hasOwnProperty("hits")) {
  //   return null;
  // }
  // let { arcs, labels, maxDepth } = treeRings || {};

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );
  // const count = searchResults.status.hits;
  // if (count > 10000) {
  //   return (
  //     <div className={css}>
  //       <div className={styles.header} style={{ cursor: "default" }}>
  //         <span className={styles.title}>Tree</span>
  //         <span>
  //           {" "}
  //           (not available for queries returning over 10,000 results)
  //         </span>
  //       </div>
  //     </div>
  //   );
  // }
  // const [position, setPosition] = useState({
  //   x: undefined,
  //   y: undefined,
  // });

  let divHeight = height;
  let divWidth = width;
  height = plotHeight;
  width = 1000;
  // const [dimensions, setDimensions] = useState({
  //   x: 0,
  //   y: 0,
  //   height: plotHeight,
  //   width: 1000,
  // });

  const [highlight, setHighlight] = useState();
  const [tooltip, setTooltip] = useState({});
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const [scale, setScale] = useState(1);
  const padding = 500;
  let xMax = divWidth;
  let previewScale = 1;
  let previewWidth = xMax;
  let previewHeight = plotHeight + 10;
  let previewRatio = 1;
  let previewDivHeight = divHeight;

  const scrollContainerRef = useRef(null);
  const stageRef = useRef(null);
  const previewRef = useRef(null);
  let maxY = plotHeight - divHeight + 10;
  let yScale = scaleLinear()
    .domain([0, plotHeight + 10 - divHeight])
    .range([0, divHeight]);
  let previewYScale = scaleLinear();
  let globalYScale = scaleLinear();

  // Element scroll positionxMax
  useScrollPosition(
    ({ currPos }) => {
      let y = Math.min(currPos.y, maxY);
      // if (plotHeight > previewHeight) {
      let previewY = 0;
      previewY = yScale(currPos.y);
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
    let y = event.target.y();
    setScrollPosition({
      x,
      y,
    });
    scrollContainerRef.current.scrollLeft = x;
    scrollContainerRef.current.scrollTop = y;
  };

  const handleGlobalDragEnd = (event) => {
    let x = scrollPosition.x;
    let y = event.target.y();
    y = globalYScale.invert(y);
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
    y = previewYScale(y);
    y = Math.max(Math.min(y, maxY), 0);
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
      setScale(divWidth / (xMax || divWidth));
    }
    if (stageRef.current) {
      setScrollBarWidth(
        stageRef.current.offsetWidth - stageRef.current.clientWidth
      );
    }
  }, [treeRef, stageRef]);

  const highlightSegment = (segment) => {
    setHighlight(segment);
  };

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

  const strokeScale = scaleLog()
    .domain([100, 1000])
    .range([1, 0.1])
    .clamp(true);

  let strokeWidth = 1;
  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [labels, setLabels] = useState([]);
  const [regions, setRegions] = useState([]);

  const longPressCallback = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const { segment } = tooltip;
    handleSearch({
      root: segment.taxon_id,
      name: segment.scientific_name,
      depth: segment.depth,
    });
  }, []);

  const longPress = useLongPress(longPressCallback, {
    onStart: (e) => e.preventDefault(),
    onCancel: (e) => {
      // highlightSegment();
      const { segment } = tooltip;
      handleNavigation({
        root: segment.taxon_id,
        name: segment.scientific_name,
        depth: segment.depth,
      });
    },
    captureEvent: true,
    threshold: 500,
  });

  let mouseDown = false;
  let mouseDownTimeout;

  useEffect(() => {
    if (lines) {
      let newPaths = [];
      let newNodes = [];
      let newLabels = [];
      let newRegions = [];
      lines.forEach((segment) => {
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
        {
          segment.vLine &&
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
              segment.tip
                ? segment.label.length * 6 + segment.width
                : segment.width
            }
            height={segment.yMax - segment.yMin}
            fill={"rgba(0,0,0,0.1)"}
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
            // onClick={() =>
            //   handleSearch({
            //     root: segment.taxon_id,
            //     name: segment.scientific_name,
            //     depth: segment.depth,
            //   })
            // }
          />
        );
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
        {
          segment.label &&
            newLabels.push(
              <Text
                key={`t-${segment.taxon_id}`}
                text={segment.label}
                fontSize={10}
                x={segment.tip ? segment.xEnd + 10 : segment.xStart - 6}
                y={segment.tip ? segment.yMin : segment.yStart - 11}
                width={segment.tip ? segment.label.length * 6 : segment.width}
                height={segment.yMax - segment.yMin}
                fill={segment.color}
                align={segment.tip ? "left" : "right"}
                verticalAlign={segment.tip ? "middle" : "top"}
                // onPointerEnter={(e) => highlightSegment(segment)}
                // onPointerLeave={(e) => highlightSegment()}
                // onClick={(e) => highlightSegment(segment)}
              />
            );
        }
        //               <text
        //                 // onPointerEnter={(e) => highlightSegment(segment)}
        //                 // onPointerLeave={(e) => highlightSegment()}
        //                 {...longPress}
        //                 fill={segment.color}
        //                 style={{ cursor: "pointer" }}
        //                 x={segment.xEnd}
        //                 y={segment.yStart}
        //                 textAnchor={segment.tip ? "start" : "end"}
        //                 alignmentBaseline={segment.tip ? "middle" : "bottom"}
        //                 transform={`translate(${segment.tip ? 10 : -6}, ${
        //                   segment.tip ? 0 : -2
        //                 })`}
        //               >
        //                 {segment.label}
        //               </text>
        //             )}
        //         <circle
        //           r={4}
        //           cx={segment.xEnd}
        //           cy={segment.yStart}
        //           stroke={segment.color}
        //           fill={"white"}
        //           strokeWidth={strokeWidth * 2}
        //         />
      });
      setNodes(newNodes);
      setPaths(newPaths);
      setLabels(newLabels);
      setRegions(newRegions);
    }
  }, [lines]);

  // if (lines) {
  //   lines.forEach((segment) => {
  //     const longPressCallback = useCallback((e) => {
  //       e.preventDefault();
  //       e.stopPropagation();
  //       handleSearch({
  //         root: segment.taxon_id,
  //         name: segment.scientific_name,
  //         depth: segment.depth,
  //       });
  //     }, []);

  //     const longPress = useLongPress(longPressCallback, {
  //       onStart: (e) => e.preventDefault(),
  //       onCancel: (e) => {
  //         highlightSegment();
  //         handleNavigation({
  //           root: segment.taxon_id,
  //           name: segment.scientific_name,
  //           depth: segment.depth,
  //         });
  //       },
  //       captureEvent: true,
  //       threshold: 500,
  //     });

  //     const clear = "rgba(255,255,255,0)";

  //     paths.push(
  //       // <Tooltip
  //       //   key={segment.taxon_id}
  //       //   title={segment.scientific_name}
  //       //   onPointerMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
  //       //   PopperProps={{
  //       //     anchorEl: {
  //       //       clientHeight: 0,
  //       //       clientWidth: 0,
  //       //       getBoundingClientRect: () => ({
  //       //         top: position.y,
  //       //         left: position.x,
  //       //         right: position.x,
  //       //         bottom: position.y + 10,
  //       //         width: 0,
  //       //         height: 10,
  //       //       }),
  //       //     },
  //       //   }}
  //       //   arrow
  //       //   placement="bottom"
  //       // >
  //       <>
  //         <path
  //           stroke={segment.color}
  //           fill="none"
  //           strokeWidth={strokeWidth}
  //           d={segment.hLine}
  //         />
  //         {segment.vLine && (
  //           <path
  //             stroke={segment.color}
  //             fill="none"
  //             strokeWidth={strokeWidth}
  //             d={segment.vLine}
  //           />
  //         )}
  //         <circle
  //           r={4}
  //           cx={segment.xEnd}
  //           cy={segment.yStart}
  //           stroke={segment.color}
  //           fill={"white"}
  //           strokeWidth={strokeWidth * 2}
  //         />
  //         <Tooltip
  //           title={segment.scientific_name}
  //           onPointerMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
  //           PopperProps={{
  //             anchorEl: {
  //               clientHeight: 0,
  //               clientWidth: 0,
  //               getBoundingClientRect: () => ({
  //                 top: position.y,
  //                 left: position.x,
  //                 right: position.x,
  //                 bottom: position.y + 10,
  //                 width: 0,
  //                 height: 10,
  //               }),
  //             },
  //           }}
  //           arrow
  //           placement="bottom"
  //         >
  //           <g>
  //             {segment.label && (
  //               <text
  //                 // onPointerEnter={(e) => highlightSegment(segment)}
  //                 // onPointerLeave={(e) => highlightSegment()}
  //                 {...longPress}
  //                 fill={segment.color}
  //                 style={{ cursor: "pointer" }}
  //                 x={segment.xEnd}
  //                 y={segment.yStart}
  //                 textAnchor={segment.tip ? "start" : "end"}
  //                 alignmentBaseline={segment.tip ? "middle" : "bottom"}
  //                 transform={`translate(${segment.tip ? 10 : -6}, ${
  //                   segment.tip ? 0 : -2
  //                 })`}
  //               >
  //                 {segment.label}
  //               </text>
  //             )}
  //             <rect
  //               // onPointerEnter={(e) => highlightSegment(segment)}
  //               // onPointerLeave={(e) => highlightSegment()}
  //               {...longPress}
  //               fill={clear}
  //               style={{ cursor: "pointer" }}
  //               x={segment.xStart}
  //               y={segment.yMin}
  //               width={
  //                 // segment.tip ? dimensions.width - segment.xStart : segment.width
  //                 segment.width
  //               }
  //               height={segment.height}
  //               stroke="none"
  //             />
  //           </g>
  //         </Tooltip>
  //       </>
  //     );
  //   });
  // }

  // let highlightPath;
  // if (highlight) {
  //   highlightPath = (
  //     <g style={{ pointerEvents: "none" }}>
  //       <path
  //         fill={"white"}
  //         strokeWidth={3}
  //         stroke={highlight.highlightColor}
  //         fillOpacity={0.25}
  //         d={highlight.highlight}
  //       />
  //     </g>
  //   );
  // }
  // let text = [];
  // let defs = [];
  // if (labels) {
  //   labels.forEach((label) => {
  //     defs.push(
  //       <path
  //         key={label.taxon_id}
  //         id={`${label.taxon_id}-label-path`}
  //         style={{ pointerEvents: "none" }}
  //         d={label.arc}
  //       />
  //     );
  //     text.push(
  //       <text
  //         fill={"white"}
  //         style={{ pointerEvents: "none" }}
  //         textAnchor="middle"
  //         fontSize={label.labelScale > 1 && `${label.labelScale * 10}pt`}
  //       >
  //         <textPath
  //           xlinkHref={`#${label.taxon_id}-label-path`}
  //           startOffset="50%"
  //           alignmentBaseline="central"
  //         >
  //           {label.scientific_name}
  //         </textPath>
  //       </text>
  //     );
  //   });
  // }

  // const handleHighlightChange = (e, key) => {
  //   e.stopPropagation();
  //   setHighlightParams({ ...highlightParams, [key]: e.target.value });
  // };

  // const handleHighlightUpdate = (e) => {
  //   e.stopPropagation();
  //   setTreeHighlight(highlightParams);
  //   // if (!treeQuery) {
  //   fetchTree(rootNode);
  //   // }
  //   //
  // };

  // const handleDismissTree = (e) => {
  //   e.stopPropagation();
  //   fetchNodes({});
  //   setTreeHighlight({});
  //   setTreeQuery();
  // };

  let fields = {};
  let index = "";
  // Object.keys(types).forEach((key) => {
  //   if (key == highlightParams.field) {
  //     index = key;
  //   }
  //   fields[key] = key;
  // });
  css = undefined;
  previewHeight = Math.min(10000, plotHeight + 10);
  previewRatio = previewHeight / (plotHeight + 10);
  previewScale = divHeight / previewHeight;
  previewWidth = previewScale * divWidth;
  if (previewWidth > divWidth / 8) {
    previewWidth = divWidth / 8;
    previewScale = previewWidth / divWidth;
    previewDivHeight = previewScale * previewHeight;
  }

  globalYScale
    .domain([0, plotHeight + 10 - divHeight])
    .range([0, divHeight - divHeight * previewRatio]);

  previewYScale = scaleLinear()
    .domain([0, previewDivHeight / previewRatio])
    .range([0 - previewDivHeight / 2, plotHeight + 10 - previewDivHeight / 2]);

  let preview;

  if (plotHeight > divHeight * 1.5) {
    let globalPosition;
    if (previewHeight < plotHeight + 10) {
      globalPosition = (
        <div
          style={{
            height: previewDivHeight,
            overflow: "hidden",
            width: 10,
            position: "absolute",
            top: 0,
            left: -10,
            // border: "rgba(0,0,0,0.1) solid 1px",
            // borderLeft: "none",
            // boxSizing: "border-box",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              height: previewDivHeight,
              width: 10,
              position: "absolute",
              right: 0,
              pointerEvents: "auto",
            }}
          >
            <Stage width={10} height={previewDivHeight} pixelRatio={1}>
              <Layer>
                <Rect
                  x={0}
                  width={10}
                  y={globalYScale(scrollPosition.y)}
                  height={previewDivHeight * previewRatio}
                  // stroke={"black"}
                  fill={"rgba(0,0,0,0.1)"}
                  onClick={handlePreviewClick}
                  draggable
                  onDragStart={handleDragStart}
                  onDragMove={(e) =>
                    handleDragMove(
                      e,
                      divHeight - previewDivHeight * previewRatio
                    )
                  }
                  onDragEnd={handleGlobalDragEnd}
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
                  width={xMax}
                  y={0}
                  height={plotHeight}
                  // stroke={"black"}
                  fill={"rgba(0,0,0,0)"}
                  onClick={handlePreviewClick}
                />
              </Layer>
              <Layer>
                <Rect
                  x={0}
                  width={xMax}
                  y={
                    // scrollPosition.y -
                    // previewOffset.y / previewScale / previewRatio
                    yScale.invert(previewOffset.y)
                  }
                  height={divHeight}
                  // stroke={"black"}
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
            height: plotHeight + 10,
            width: divWidth,
            position: "absolute",
            overflow: "hidden",
          }}
          ref={stageRef}
        >
          <div
            style={{
              height: divHeight + padding * 2,
              width: divWidth, // + padding * 2,
              top: scrollPosition.y - padding,
              left: scrollPosition.x, // - padding,
              overflowY: "hidden",
              // transform: `translate(${scrollPosition.x}, ${
              //   scrollPosition.y * 2
              // })`,
              position: "absolute",
            }}
          >
            <Stage
              width={divWidth} // + padding * 2}
              height={divHeight + padding * 2}
              x={-scrollPosition.x} // + padding}
              y={-scrollPosition.y + padding}
              pixelRatio={1}
              // ref={treeRef}
              // scaleX={scale}
              // scaleY={scale}
            >
              <Layer>
                <Rect
                  x={scrollPosition.x}
                  width={divWidth}
                  y={scrollPosition.y - padding}
                  height={divHeight + padding * 2}
                  // stroke={"black"}
                  fill={"white"}
                />
              </Layer>
              <Layer>{paths}</Layer>
              <Layer>
                <Group>{labels}</Group>
                <Group>{nodes}</Group>
                <Group>{regions}</Group>
              </Layer>
              <Layer>
                <KonvaTooltip {...tooltip} />
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
