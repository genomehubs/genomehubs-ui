import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";
import withRecord from "../hocs/withRecord";

const LineagePanel = ({ taxon_id, names }) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel
  );
  let nameDivs = [];
  names.forEach((name, i) => {
    nameDivs.push(
      <span key={i} className={styles.name}>
        {name.name} — {name.class}
      </span>
    );
  });

  return (
    <div className={css}>
      <div className={styles.header}>
        <span className={styles.title}>Names</span>
      </div>
      <div style={{ maxWidth: "100%" }}>{nameDivs}</div>
    </div>
  );
};

export default compose(withRecord)(LineagePanel);
