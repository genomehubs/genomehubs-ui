import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import LineagePanel from "./LineagePanel";
import AttributePanel from "./AttributePanel";
import NamesPanel from "./NamesPanel";
import SearchBox from "./SearchBox";
import withLocation from "../hocs/withLocation";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";

const RecordPage = ({
  record,
  recordId,
  fetchRecord,
  types,
  searchById = {},
}) => {
  let results = [];
  let taxon = {};
  useEffect(() => {
    if (recordId) {
      fetchRecord(recordId);
    }
  }, [recordId]);
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
  // if (taxon_id) {
  //   results.push(
  //     <ResultPanel key={taxon_id} {...searchById} {...record.lineage.taxon} />
  //   );
  // }
  // lineage.lineage.forEach((ancestor, i) => {
  //   let summaryId;
  //   if (summaryField) {
  //     summaryId = `${ancestor.taxon_id}--${summaryField}--histogram`;
  //   }

  //   results.push(
  //     <ResultPanel
  //       key={ancestor.taxon_id}
  //       {...ancestor}
  //       summaryId={summaryId}
  //       sequence={i + 1}
  //     />
  //   );
  // });
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
  withTypes
)(RecordPage);
