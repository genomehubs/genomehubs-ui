import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";
import withLocation from "../hocs/withLocation";
import withLookup from "../hocs/withLookup";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";

const LineagePanel = ({
  taxon_id,
  chooseView,
  setRecordId,
  lineage,
  fetchSearchResults,
  setLookupTerm,
  fetchLookup,
}) => {
  const handleTaxonClick = (taxon, value) => {
    if (taxon != taxon_id) {
      setRecordId(taxon);
      fetchSearchResults(`tax_eq(${taxon})`);
      setLookupTerm(`tax_name(${value})`);
      fetchLookup(`tax_name(${value})`, "taxon");
    }
  };

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );
  let lineageDivs = [];
  lineage.forEach((ancestor) => {
    lineageDivs.push(
      <span
        key={ancestor.taxon_id}
        className={styles.lineage}
        onClick={() =>
          handleTaxonClick(ancestor.taxon_id, ancestor.scientific_name)
        }
        title={`${ancestor.taxon_rank}: ${ancestor.scientific_name} [taxid: ${ancestor.taxon_id}]`}
      >
        {ancestor.scientific_name}
      </span>
    );
  });

  return (
    <div className={css}>
      <div className={styles.header}>
        <span className={styles.title}>Lineage</span>
      </div>
      <div style={{ maxWidth: "100%" }}>{lineageDivs}</div>
    </div>
  );
};

export default compose(
  withLocation,
  withLookup,
  withSearch,
  withRecord
)(LineagePanel);
