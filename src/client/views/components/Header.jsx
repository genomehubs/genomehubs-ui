import React from "react";
// import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import SiteName from "./SiteName";
// import Preferences from "./Preferences";
import Tabs from "./Tabs";
import { Router } from "@reach/router";

const basename = BASENAME || "view";

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
