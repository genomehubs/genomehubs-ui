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
  let arcs, rings;
  if (treeRings) {
    arcs = treeRings.arcs;
    rings = treeRings.rings;
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

  //   console.log(nodes);
  let paths = [];
  if (arcs) {
    arcs.forEach((segment) => {
      paths.push(
        <Tooltip
          key={segment.taxon_id}
          followCursor
          title={segment.scientific_name}
          arrow
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

  let ranks = [];
  let defs = [];
  if (rings) {
    rings.forEach((ring) => {
      defs.push(
        <path
          key={ring.taxon_rank}
          id={`${ring.taxon_rank}-rank-path`}
          d={ring.arc}
        />
      );
      ranks.push(
        <text dy="-5" fill={"white"} style={{ pointerEvents: "none" }}>
          <textPath xlinkHref={`#${ring.taxon_rank}-rank-path`}>
            {ring.taxon_rank}
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
              {/* <defs>{defs}</defs> */}
              {paths}
              {/* {ranks} */}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default compose(withSearch, withTree)(TreePanel);
