import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import SearchBox from "./SearchBox";
import withLocation from "../hocs/withLocation";
import withExplore from "../hocs/withExplore";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withTypes from "../hocs/withTypes";

const ExplorePage = ({
  lineage,
  searchById = {},
  summaryField,
  types,
  fetchTypes,
}) => {
  useEffect(() => {
    if (Object.keys(types).length == 0) {
      fetchTypes("taxon");
    }
  }, []);
  let results = [];
  let taxon_id;
  if (lineage.taxon) {
    taxon_id = lineage.taxon.taxon_id;
  }
  let summary;
  if (types[summaryField]) {
    if (types[summaryField].bins) {
      summary = "histogram";
    } else if (types[summaryField].type == "keyword") {
      summary = "terms";
    }
  }

  if (taxon_id) {
    let summaryId;
    if (summaryField && types[summaryField]) {
      summaryId = `${taxon_id}--${summaryField}--${summary}`;
    }
    results.push(
      <ResultPanel
        key={taxon_id}
        {...searchById}
        {...lineage.taxon}
        summaryId={summaryId}
        summary={summary}
      />
    );
  }
  lineage.lineage.forEach((ancestor, i) => {
    let summaryId;
    if (summaryField) {
      summaryId = `${ancestor.taxon_id}--${summaryField}--${summary}`;
    }

    results.push(
      <ResultPanel
        key={ancestor.taxon_id}
        {...ancestor}
        summaryId={summaryId}
        sequence={i + 1}
        summary={summary}
      />
    );
  });
  return (
    <div className={styles.infoPage}>
      <SearchBox />
      <div
        className={classnames(
          styles.flexCenter,
          styles.flexCenterHorizontal,
          styles.fullWidth
        )}
      >
        {results}
      </div>
    </div>
  );
};

export default compose(
  withLocation,
  withRecord,
  withSearch,
  withTypes,
  withSummary,
  withExplore
)(ExplorePage);
