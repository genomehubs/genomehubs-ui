import React, { useEffect } from "react";

import Skeleton from "@material-ui/lab/Skeleton";
import { TagCloud } from "react-tagcloud";
import Tooltip from "@material-ui/core/Tooltip";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import { useVisible } from "react-hooks-visible";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withSummaryById from "../hocs/withSummaryById";

const WordCloud = ({
  summaryId,
  sequence = 0,
  scientific_name,
  summaryById,
  fetchSummary,
  searchIndex,
  fetchSearchResults,
  setPreferSearchTerm,
  resetLookup,
}) => {
  const navigate = useNavigate();
  const height = 100;
  const [targetRef, visible] = useVisible();
  let parts = summaryId.split("--");
  useEffect(() => {
    if (summaryId && visible) {
      setTimeout(() => {
        fetchSummary(parts[0], parts[1], parts[2], searchIndex);
      }, sequence * 100);
    }
  }, [summaryId, visible]);
  const handleClick = (bucket) => {
    let query = `tax_tree(${parts[0]}) AND ${parts[1]}=${bucket.value}`;
    updateSearch({
      query,
      searchRawValues: true,
      includeEstimates: false,
      result: "taxon",
    });
  };
  const updateSearch = (options) => {
    // fetchSearchResults(options);
    setPreferSearchTerm(false);
    navigate(
      `search?${qs.stringify(options)}#${encodeURIComponent(scientific_name)}`
    );
    resetLookup();
  };
  let buckets = [];
  if (summaryById && summaryById.buckets) {
    buckets = summaryById.buckets;
  }
  if (buckets.length > 0 && summaryById.max == 0) {
    return (
      <svg
        viewBox={"0 0 1000 25"}
        preserveAspectRatio="xMinYMin"
        ref={targetRef}
      >
        <text
          style={{ fontSize: "12px" }}
          x={1000 / 2}
          y={25 / 2}
          fillOpacity={0.5}
          textAnchor="middle"
          alignmentBaseline="central"
          pointerEvents={"none"}
        >
          no data
        </text>
      </svg>
    );
  }
  if (buckets.length == 0) {
    return (
      <div className={styles.fullWidth} ref={targetRef}>
        <Skeleton variant="rect" width={400} height={50} />
      </div>
    );
  }
  return (
    <div ref={targetRef}>
      <TagCloud
        className={styles.tagCloud}
        minSize={12}
        maxSize={35}
        tags={buckets}
        disableRandomColor
        onClick={handleClick}
      />
    </div>
  );
};

export default compose(
  withLookup,
  withSearch,
  withSummary,
  withSummaryById
)(WordCloud);
