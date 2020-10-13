import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import loadable from "@loadable/component";

const Main = loadable(() => import("./Main"));
const Header = loadable(() => import("./Header"));
const Footer = loadable(() => import("./Footer"));

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <Main />
      <Footer />
    </div>
  );
};

export default Layout;
