import React, { useEffect } from "react";

import ResultPanel from "./ResultPanel";
import SearchBox from "./SearchBox";
import TextPanel from "./TextPanel";
import classnames from "classnames";
import { compose } from "recompose";
import qs from "qs";
import { setSearchIndex } from "../reducers/search";
import styles from "./Styles.scss";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSetLookup from "../hocs/withSetLookup";
import withSummary from "../hocs/withSummary";
import withTypes from "../hocs/withTypes";

const ExplorePage = ({
  lineage,
  fetchRecord,
  record,
  searchById = {},
  summaryField,
  setSummaryField,
  setLookupTerm,
  setSearchIndex,
  fetchSearchResults,
  setRecordId,
  types,
}) => {
  let results = [];
  let taxon_id;
  if (lineage) {
    taxon_id = lineage.taxon.taxon_id;
  }
  let options = qs.parse(location.search.replace(/^\?/, ""));
  let hashTerm = decodeURIComponent(location.hash.replace(/^\#/, ""));
  useEffect(() => {
    if (options.taxon_id && !record.isFetching) {
      if (options.taxon_id != taxon_id || options.field_id != summaryField) {
        fetchSearchResults({
          query: `tax_eq(${options.taxon_id})`,
          result: options.result,
          includeEstimates: true,
        });
        fetchRecord(options.taxon_id, options.result);
        setRecordId(options.taxon_id);
        setSearchIndex(options.result);
        setSummaryField(options.field_id);
      }
    }
    if (hashTerm) {
      setLookupTerm(hashTerm);
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
  if (lineage) {
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
  }

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
  withSetLookup
)(ExplorePage);
