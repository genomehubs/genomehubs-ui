import React, { memo, useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import LineagePanel from "./LineagePanel";
import TextPanel from "./TextPanel";
import AttributePanel from "./AttributePanel";
import NamesPanel from "./NamesPanel";
import SearchBox from "./SearchBox";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSetLookup from "../hocs/withSetLookup";
import withTypes from "../hocs/withTypes";
import qs from "qs";

const RecordPage = ({
  location,
  record,
  recordId,
  fetchRecord,
  setRecordId,
  setLookupTerm,
  fetchSearchResults,
  setSearchIndex,
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
    if (options.taxon_id && options.taxon_id != recordId) {
      setRecordId(options.taxon_id);
      fetchSearchResults({
        query: `tax_eq(${options.taxon_id})`,
        result: options.result,
        includeEstimates: true,
      });
    } else if (recordId) {
      fetchRecord(recordId, options.result);
    }
    if (hashTerm) {
      setLookupTerm(hashTerm);
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
  memo,
  withRecord,
  withSearch,
  withSetLookup,
  withTypes
)(RecordPage);
