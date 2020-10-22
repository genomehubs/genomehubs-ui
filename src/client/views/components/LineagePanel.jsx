import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";
import withLookup from "../hocs/withLookup";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import { useNavigate } from "@reach/router";
import qs from "qs";

const LineagePanel = ({
  taxon_id,
  setRecordId,
  lineage,
  fetchSearchResults,
  resetLookup,
}) => {
  const navigate = useNavigate();

  const handleTaxonClick = (taxon, value) => {
    if (taxon != taxon_id) {
      setRecordId(taxon);
      fetchSearchResults({ query: `tax_eq(${taxon})` });
      navigate(`?taxon_id=${taxon}`);
      resetLookup();
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

export default compose(withLookup, withSearch, withRecord)(LineagePanel);
