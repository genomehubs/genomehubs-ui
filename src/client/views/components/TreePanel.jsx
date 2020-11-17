import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { formatter } from "../functions/formatter";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withTree from "../hocs/withTree";
import Tooltip from "@material-ui/core/Tooltip";
import { useLocation, useNavigate } from "@reach/router";

const TreePanel = ({ root_id, treeRings, searchTerm, fetchNodes }) => {
  const location = useLocation();
  const navigate = useNavigate();
  let arcs, labels;
  if (treeRings) {
    arcs = treeRings.arcs;
    labels = treeRings.labels;
  }

  const [position, setPosition] = React.useState({
    x: undefined,
    y: undefined,
  });

  const fetchTree = (root) => {
    fetchNodes({});
    let query = searchTerm.query;
    if (root) {
      query = query.replace(/tax_tree\(\w+?\)/, `tax_tree(${root})`);
    }
    fetchNodes({ ...searchTerm, query });
  };

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );

  let paths = [];
  if (arcs) {
    arcs.forEach((segment) => {
      paths.push(
        <Tooltip
          key={segment.taxon_id}
          title={segment.scientific_name}
          onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
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
            onClick={(e) => fetchTree(segment.taxon_id)}
            stroke="white"
            strokeWidth={1}
            d={segment.arc}
          />
        </Tooltip>
      );
    });
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

  return (
    <div className={css}>
      <div className={styles.header} onClick={(e) => fetchTree()}>
        <span className={styles.title}>Tree</span>
        <span> (experimental - click to view)</span>
      </div>

      <div>
        {treeRings && (
          <div
            style={{
              maxHeight: "1200px",
              maxWidth: "1200px",
              minHeight: "600px",
              minWidth: "600px",
            }}
          >
            <svg
              preserveAspectRatio="xMinYMin"
              viewBox="-500 -500 1000 1000"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <defs>{defs}</defs>
              {paths}
              {text}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default compose(withSearch, withTree)(TreePanel);
