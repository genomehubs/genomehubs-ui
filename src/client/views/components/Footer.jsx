// import React, { useEffect } from "react";

// import CopyrightIcon from "@material-ui/icons/Copyright";
// import classnames from "classnames";
// import { compose } from "recompose";
// import styles from "./Styles.scss";
// import withTypes from "../hocs/withTypes";
// import withVersion from "../hocs/withVersion";

// const Footer = ({ version, fetchTypes, types }) => {
//   useEffect(() => {
//     fetchTypes("multi");
//   }, []);

//   let dataRelease;
//   if (version.hub) {
//     let releaseLink = `release ${version.release}`;
//     if (version.source) {
//       releaseLink = (
//         <a className={styles.link} href={version.source} target="_blank">
//           {releaseLink}
//         </a>
//       );
//     }
//     dataRelease = (
//       <span style={{ float: "left", marginLeft: "1em" }}>
//         {version.hub} data {releaseLink}
//       </span>
//     );
//   }
//   return (
//     <footer>
//       {dataRelease}
//       <span style={{ float: "right", marginRight: "1em" }}>
//         Powered by{" "}
//         <a
//           className={styles.link}
//           href="https://genomehubs.org/"
//           target="_blank"
//         >
//           GenomeHubs
//         </a>{" "}
//         <CopyrightIcon fontSize="inherit" /> 2021
//       </span>
//     </footer>
//   );
// };

// export default compose(withVersion, withTypes)(Footer);

import React, { memo, useEffect, useState } from "react";

import BasicMenu from "./BasicMenu";
import CopyrightIcon from "@material-ui/icons/Copyright";
import Grid from "@material-ui/core/Grid";
import Taxonomy from "./Taxonomy";
import bbsrcLogo from "./img/bbsrc-logo.png";
import classnames from "classnames";
import { compose } from "recompose";
import dispatchRecord from "../hocs/dispatchRecord";
import dtolLogo from "./img/dtol-logo.png";
import qs from "qs";
import { resetRecord } from "../reducers/record";
import sangerLogo from "./img/sanger-logo.png";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withTaxonomy from "../hocs/withTaxonomy";
import withTypes from "../hocs/withTypes";
import withVersion from "../hocs/withVersion";

const Footer = ({ version, fetchTypes, types, resetRecord, hidden }) => {
  let options = qs.parse(location.search.replace(/^\?/, ""));
  useEffect(() => {
    fetchTypes("multi", options.taxonomy);
  }, []);
  if (hidden) {
    return null;
  }
  const navigate = useNavigate();

  let dataRelease;

  if (version.hub) {
    let releaseLink = `release ${version.release}`;
    if (version.source) {
      releaseLink = (
        <a className={styles.link} href={version.source} target="_blank">
          {releaseLink}
        </a>
      );
    }
    dataRelease = (
      <span style={{ float: "left", marginLeft: "1em" }}>
        {version.hub} data {releaseLink}
      </span>
    );
  }
  return (
    <footer>
      <Taxonomy display={false} />
      <Grid
        container
        direction="row"
        xs={12}
        spacing={0}
        style={{ maxHeight: "100%" }}
      >
        <Grid item xs={3}>
          {dataRelease}
        </Grid>
        <Grid item xs={6}>
          <img
            src={sangerLogo}
            href="https://www.sanger.ac.uk/"
            target="_blank"
          />
          <img
            src={dtolLogo}
            href="https://www.darwintreeoflife.org"
            target="_blank"
          />
          <img src={bbsrcLogo} href="https://bbsrc.ukri.org/" target="_blank" />
        </Grid>
        <Grid item xs={3}>
          <span style={{ float: "right", marginRight: "1em" }}>
            Powered by{" "}
            <a
              className={styles.link}
              href="https://genomehubs.org/"
              target="_blank"
            >
              GenomeHubs
            </a>{" "}
            <CopyrightIcon fontSize="inherit" /> 2021
          </span>
        </Grid>
      </Grid>
    </footer>
  );
};

export default compose(
  memo,
  withTaxonomy,
  dispatchRecord,
  withVersion,
  withTypes
)(Footer);
