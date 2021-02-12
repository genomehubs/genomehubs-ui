import React, { memo, useEffect } from "react";

import AnalysisPanel from "./AnalysisPanel";
import AttributePanel from "./AttributePanel";
import LineagePanel from "./LineagePanel";
import NamesPanel from "./NamesPanel";
import Page from "./Page";
import ResultPanel from "./ResultPanel";
import TextPanel from "./TextPanel";
import classnames from "classnames";
import { compose } from "recompose";
import { getRecordIsFetching } from "../reducers/record";
import qs from "qs";
import styles from "./Styles.scss";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSetLookup from "../hocs/withSetLookup";
import withTypes from "../hocs/withTypes";

const RecordPage = ({
  location,
  record,
  recordId,
  fetchRecord,
  recordIsFetching,
  setRecordId,
  setLookupTerm,
  fetchSearchResults,
  setSearchIndex,
  setPreviousSearchTerm,
  searchIndex,
  types,
  searchById = {},
}) => {
  let results = [];
  let taxon = {};
  let options = qs.parse(location.search.replace(/^\?/, ""));
  let hashTerm = decodeURIComponent(location.hash.replace(/^\#/, ""));
  useEffect(() => {
    if (options.result != searchIndex) {
      setSearchIndex(options.result);
    }
    if (options.record_id && options.record_id != recordId) {
      setRecordId(options.record_id);
      let searchTerm = {
        result: options.result,
        includeEstimates: true,
      };
      if (options.result == "taxon") {
        searchTerm.query = `tax_eq(${options.record_id})`;
      } else {
        searchTerm.query = "";
      }
      setPreviousSearchTerm(searchTerm);
      fetchSearchResults(searchTerm);
    } else if (recordId) {
      if (
        options.result == "taxon" &&
        (!record.record || recordId != record.record.taxon_id)
      ) {
        if (!recordIsFetching) fetchRecord(recordId, options.result);
        if (hashTerm) setLookupTerm(hashTerm);
      } else if (
        options.result == "assembly" &&
        (!record.record || recordId != record.record.assembly_id)
      ) {
        if (!recordIsFetching) fetchRecord(recordId, options.result);
        if (hashTerm) setLookupTerm(hashTerm);
      }
    }
  }, [options]);
  if (record && record.record && record.record.taxon_id) {
    taxon = {
      taxon_id: record.record.taxon_id,
      scientific_name: record.record.scientific_name,
      taxon_rank: record.record.taxon_rank,
    };
    results.push(
      <ResultPanel key={taxon.taxon_id} {...searchById} {...taxon} />
    );

    if (record.record.lineage) {
      results.push(
        <LineagePanel
          key={"lineage"}
          taxon_id={taxon.taxon_id}
          lineage={record.record.lineage.slice().reverse()}
        />
      );
    }
    if (record.record.taxon_names) {
      results.push(
        <NamesPanel
          key={"names"}
          taxon_id={taxon.taxon_id}
          names={record.record.taxon_names}
        />
      );
    }

    results.push(
      <AnalysisPanel
        key={"analysis"}
        recordId={record.record.record_id}
        result={options.result}
      />
    );

    if (record.record.attributes) {
      Object.keys(record.record.attributes).forEach((key) => {
        let field = record.record.attributes[key];
        field.id = key;
        results.push(
          <AttributePanel
            key={field.id}
            taxon_id={taxon.taxon_id}
            field={field}
            meta={types[key]}
          />
        );
      });
    }
  }

  let text = <TextPanel view={"records"}></TextPanel>;

  return (
    <Page
      id={"record-page"}
      searchBox
      panels={[{ panel: results }]}
      text={text}
    />
  );
};

export default compose(
  memo,
  withRecord,
  withSearch,
  withSetLookup,
  withTypes
)(RecordPage);
