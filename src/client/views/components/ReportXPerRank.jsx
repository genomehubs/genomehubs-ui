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
            <span
              style={{
                display: "inline-block",
                minWidth: "3em",
                textAlign: "right",
                marginRight: "1em",
              }}
            >
              {entry.x.toLocaleString()}
            </span>
            <span>{plural}</span>
          </div>
        );
      }
    });
  } else {
    return null;
  }
  return <Fragment>{values}</Fragment>;
};

export default ReportXPerRank;
