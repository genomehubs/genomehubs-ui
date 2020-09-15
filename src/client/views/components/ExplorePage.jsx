import React from "react";
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

const ExplorePage = ({ lineage, searchById = {}, summaryField }) => {
  let results = [];
  let taxon_id;
  if (lineage.taxon) {
    taxon_id = lineage.taxon.taxon_id;
  }
  if (taxon_id) {
    let summaryId;
    if (summaryField) {
      summaryId = `${taxon_id}--${summaryField}--histogram`;
    }
    results.push(
      <ResultPanel
        key={taxon_id}
        {...searchById}
        {...lineage.taxon}
        summaryId={summaryId}
      />
    );
  }
  lineage.lineage.forEach((ancestor, i) => {
    let summaryId;
    if (summaryField) {
      summaryId = `${ancestor.taxon_id}--${summaryField}--histogram`;
    }

    results.push(
      <ResultPanel
        key={ancestor.taxon_id}
        {...ancestor}
        summaryId={summaryId}
        sequence={i + 1}
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
  withSummary,
  withExplore
)(ExplorePage);
