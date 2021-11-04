import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "@reach/router";

import Grid from "@material-ui/core/Grid";
import SVGDownloadButton from "./SVGDownloadButton";
import Tooltip from "@material-ui/core/Tooltip";
import VariableFilter from "./VariableFilter";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import { scaleLog } from "d3-scale";
import styles from "./Styles.scss";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withTree from "../hocs/withTree";
import withTypes from "../hocs/withTypes";

const TreePanel = ({
  root_id,
  rootNode,
  setRootNode,
  types,
  treeRings,
  searchTerm,
  searchResults,
  fetchNodes,
  treeHighlight,
  setTreeHighlight,
  treeQuery,
  setTreeQuery,
  newickString,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [highlightParams, setHighlightParams] = useState(treeHighlight);

  if (!searchResults.status || !searchResults.status.hasOwnProperty("hits")) {
    return null;
  }
  let { arcs, labels, maxDepth } = treeRings || {};

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );
  const count = searchResults.status.hits;
  if (count > 10000) {
    return (
      <div className={css}>
        <div className={styles.header} style={{ cursor: "default" }}>
          <span className={styles.title}>Tree</span>
          <span>
            {" "}
            (not available for queries returning over 10,000 results)
          </span>
        </div>
      </div>
    );
  }
  const [position, setPosition] = useState({
    x: undefined,
    y: undefined,
  });

  const [dimensions, setDimensions] = useState({
    x: 0,
    y: 0,
    height: 1000,
    width: 1000,
  });

  const [highlight, setHighlight] = useState();

  const anchorRef = useRef(null);

  const fetchTree = (root, name) => {
    fetchNodes({});
    let query = searchTerm.query;
    let y;
    if (root) {
      if (query.match("tax_tree")) {
        query = query.replace(/tax_tree\(\w+?\)/, `tax_tree(${root})`);
      } else {
        query += ` AND tax_tree(${root})`;
      }
    }
    if (highlightParams && highlightParams.field) {
      if (highlightParams.value && highlightParams.operator) {
        y = `${highlightParams.field}${highlightParams.operator}${highlightParams.value}`;
      } else {
        y = highlightParams.field;
      }
    }
    if (
      !searchTerm.includeEstimates ||
      searchTerm.includeEstimates == "false"
    ) {
      if (name == "parent" && query.match("tax_depth")) {
        query = query.replace(/tax_depth\(\d+\)/, `tax_depth(${maxDepth + 1})`);
        y = y.replace(/tax_depth\(\d+\)/, `tax_depth(${maxDepth + 1})`);
      }
    }
    setTreeQuery({ ...searchTerm, query, y });
    fetchNodes({ ...searchTerm, query, y });
  };

  const highlightSegment = (segment) => {
    setHighlight(segment);
  };

  const strokeScale = scaleLog()
    .domain([100, 1000])
    .range([1, 0.1])
    .clamp(true);

  let strokeWidth = strokeScale((arcs || 1).length);

  let paths = [];
  if (arcs) {
    arcs.forEach((segment) => {
      paths.push(
        <Tooltip
          key={segment.taxon_id}
          title={segment.scientific_name}
          onPointerMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
          PopperProps={{
            anchorEl: {
              clientHeight: 0,
              clientWidth: 0,
              getBoundingClientRect: () => ({
                top: position.y,
                left: position.x,
                right: position.x,
                bottom: position.y + 10,
                width: 0,
                height: 10,
              }),
            },
          }}
          arrow
          placement="bottom"
        >
          <path
            key={segment.taxon_id}
            fill={segment.color}
            onPointerEnter={(e) => highlightSegment(segment)}
            onPointerLeave={(e) => highlightSegment()}
            onClick={(e) => {
              setRootNode(segment.taxon_id);
              highlightSegment();
              fetchTree(segment.taxon_id, segment.scientific_name);
              // setDimensions({
              //   x: 0,
              //   y: 0,
              //   width: 2000,
              //   height: 1000,
              // });
            }}
            stroke="white"
            strokeWidth={strokeWidth}
            d={segment.arc}
          />
        </Tooltip>
      );
    });
  }

  let highlightPath;
  if (highlight) {
    highlightPath = (
      <g style={{ pointerEvents: "none" }}>
        <path
          fill={"white"}
          strokeWidth={3}
          stroke={highlight.highlightColor}
          fillOpacity={0.25}
          d={highlight.highlight}
        />
      </g>
    );
  }
  let text = [];
  let defs = [];
  if (labels) {
    labels.forEach((label) => {
      defs.push(
        <path
          key={label.taxon_id}
          id={`${label.taxon_id}-label-path`}
          d={label.arc}
        />
      );
      text.push(
        <text
          fill={"white"}
          style={{ pointerEvents: "none" }}
          textAnchor="middle"
          fontSize={label.labelScale > 1 && `${label.labelScale * 10}pt`}
        >
          <textPath
            xlinkHref={`#${label.taxon_id}-label-path`}
            startOffset="50%"
            alignmentBaseline="central"
          >
            {label.scientific_name}
          </textPath>
        </text>
      );
    });
  }

  const handleHighlightChange = (e, key) => {
    e.stopPropagation();
    setHighlightParams({ ...highlightParams, [key]: e.target.value });
  };

  const handleHighlightUpdate = (e) => {
    e.stopPropagation();
    setTreeHighlight(highlightParams);
    // if (!treeQuery) {
    fetchTree(rootNode);
    // }
    //
  };

  const handleDismissTree = (e) => {
    e.stopPropagation();
    fetchNodes({});
    setTreeHighlight({});
    setTreeQuery();
  };

  let fields = {};
  let index = "";
  Object.keys(types).forEach((key) => {
    if (key == highlightParams.field) {
      index = key;
    }
    fields[key] = key;
  });

  return (
    <div className={css}>
      <div className={styles.header} style={{ cursor: "default" }}>
        <span className={styles.title}>Tree</span>
      </div>
      <Grid container alignItems="center" direction="row" spacing={2}>
        <Grid item>
          {Object.keys(fields).length > 1 && (
            <VariableFilter
              field={highlightParams.field}
              fields={fields}
              operator={highlightParams.operator}
              value={highlightParams.value}
              summary="value"
              handleVariableChange={(e) => handleHighlightChange(e, "field")}
              handleOperatorChange={(e) => handleHighlightChange(e, "operator")}
              handleValueChange={(e) => handleHighlightChange(e, "value")}
              handleUpdate={handleHighlightUpdate}
              handleDismiss={(e) => handleDismissTree(e, "value")}
            />
          )}
        </Grid>
      </Grid>
      {treeRings && (
        <div>
          <div>
            <div
              style={{
                maxHeight: "1200px",
                maxWidth: "1200px",
                minHeight: "600px",
                minWidth: "600px",
                opacity: treeQuery ? "1" : "0.67",
              }}
            >
              <svg
                preserveAspectRatio="xMinYMin"
                ref={anchorRef}
                viewBox={`${dimensions.x} ${dimensions.y} ${dimensions.width} ${dimensions.height}`}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <defs>{defs}</defs>
                <g
                  transform="translate(500, 500)"
                  style={{
                    fontFamily:
                      '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontSize: "10pt",
                  }}
                >
                  {paths}
                  {text}
                  {highlightPath}
                </g>
              </svg>
            </div>
            <Grid container alignItems="center" direction="row" spacing={2}>
              <Grid item style={{ marginLeft: "auto" }}>
                <SVGDownloadButton
                  targetRef={anchorRef}
                  filename="tree"
                  string={newickString}
                />
              </Grid>
            </Grid>
          </div>
        </div>
      )}
    </div>
  );
};

export default compose(withSearch, withTree, withTypes)(TreePanel);
