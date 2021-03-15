import React from "react";
import { Router } from "@reach/router";
import SiteName from "./SiteName";
// import Preferences from "./Preferences";
import Tabs from "./Tabs";
// import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";

const basename = BASENAME || "";

const Header = () => {
  return (
    <header>
      <SiteName />
      {/* <Preferences /> */}
      <Router basepath={basename} className={styles.tabHolder} primary={false}>
        <Tabs default />
      </Router>
    </header>
  );
};

export default Header;
