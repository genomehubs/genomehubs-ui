import React, { Fragment } from "react";

import styles from "./Styles.scss";

const ranks = {
  superkingdom: { plural: "superkingdoms" },
  kingdom: { plural: "kingdoms" },
  phylum: { plural: "phyla" },
  class: { plural: "classes" },
  order: { plural: "orders" },
  family: { plural: "families" },
  genus: { plural: "genera" },
  species: { plural: "species" },
  subspecies: { plural: "subspecies" },
};

const ReportXPerRank = ({ perRank }) => {
  let values = [];
  if (perRank && perRank.status) {
    perRank.report.xPerRank.forEach((entry) => {
      if (entry.x) {
        let plural =
          entry.x != 1 && ranks[entry.rank]
            ? ranks[entry.rank].plural
            : entry.rank;
        values.push(
          <div key={entry.rank}>
            <span className={styles.boldValue}>{entry.x.toLocaleString()}</span>
            <span>{plural}</span>
          </div>
        );
      }
    });
  } else {
    return null;
  }
  return <div style={{ width: "100%", textAlign: true }}>{values}</div>;
};

export default ReportXPerRank;
