import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import TextPanel from "./TextPanel";
import SearchBox from "./SearchBox";
import withExplore from "../hocs/withExplore";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSummary from "../hocs/withSummary";
import withTypes from "../hocs/withTypes";
import qs from "qs";

const ExplorePage = ({
  lineage,
  fetchLineage,
  searchById = {},
  summaryField,
  setSummaryField,
  fetchSearchResults,
  setRecordId,
  types,
}) => {
  let results = [];
  let taxon_id;
  if (lineage.taxon) {
    taxon_id = lineage.taxon.taxon_id;
  }
  let options = qs.parse(location.search.replace(/^\?/, ""));
  useEffect(() => {
    if (options.taxon_id && options.field_id) {
      if (options.taxon_id != taxon_id || options.field_id != summaryField) {
        fetchSearchResults({
          query: `tax_eq(${options.taxon_id})`,
          result: "taxon",
          includeEstimates: true,
        });
        fetchLineage(options.taxon_id);
        setRecordId(options.taxon_id);
        setSummaryField(options.field_id);
      }
    }
  }, [taxon_id, options]);

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

  let text = <TextPanel view={"explore"}></TextPanel>;

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
        {text}
      </div>
    </div>
  );
};

export default compose(
  withRecord,
  withSearch,
  withTypes,
  withSummary,
  withExplore
)(ExplorePage);
