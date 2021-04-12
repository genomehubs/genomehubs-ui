import React, { useEffect } from "react";

import CopyrightIcon from "@material-ui/icons/Copyright";
import classnames from "classnames";
import { compose } from "recompose";
import styles from "./Styles.scss";
import withTypes from "../hocs/withTypes";
import withVersion from "../hocs/withVersion";

const Footer = ({ version, fetchTypes, types }) => {
  useEffect(() => {
    fetchTypes("multi");
  }, []);

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
      {dataRelease}
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
    </footer>
  );
};

export default compose(withVersion, withTypes)(Footer);
