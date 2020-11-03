import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withTypes from "../hocs/withTypes";
import styles from "./Styles.scss";
import CopyrightIcon from "@material-ui/icons/Copyright";

const Footer = ({ types, fetchTypes }) => {
  useEffect(() => {
    if (Object.keys(types).length == 0) {
      fetchTypes("taxon");
    }
  }, []);
  return (
    <footer>
      Powered by{" "}
      <a className={styles.link} href="https://genomehubs.org/" target="_blank">
        GenomeHubs
      </a>{" "}
      <CopyrightIcon fontSize="inherit" /> 2020
    </footer>
  );
};

export default compose(withTypes)(Footer);
