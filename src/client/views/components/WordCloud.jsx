import React, { useEffect } from "react";
import { compose } from "recompose";
import withLocation from "../hocs/withLocation";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withSummaryById from "../hocs/withSummaryById";
import Tooltip from "@material-ui/core/Tooltip";
import { formatter } from "../functions/formatter";
import { TagCloud } from "react-tagcloud";
import styles from "./Styles.scss";

const WordCloud = ({
  summaryId,
  sequence = 0,
  summaryById,
  fetchSummary,
  fetchSearchResults,
  chooseView,
  resetLookup,
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
  const handleClick = (bucket) => {
    let query = `tax_tree(${parts[0]}) AND ${parts[1]}=${bucket.value}`;
    updateSearch({ query, searchRawValues: true });
  };
  const updateSearch = (options) => {
    fetchSearchResults(options);
    chooseView("search");
    resetLookup();
  };
  let buckets = [];
  if (summaryById && summaryById.buckets) {
    buckets = summaryById.buckets;
  }
  return (
    <TagCloud
      className={styles.tagCloud}
      minSize={12}
      maxSize={35}
      tags={buckets}
      disableRandomColor
      onClick={handleClick}
    />
  );
};

export default compose(
  withLocation,
  withLookup,
  withSearch,
  withSummary,
  withSummaryById
)(WordCloud);
