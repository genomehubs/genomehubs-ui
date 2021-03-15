import React, { Fragment, memo } from "react";

import { Router } from "@reach/router";
import classnames from "classnames";
import { compose } from "recompose";
import loadable from "@loadable/component";
import styles from "./Styles.scss";

const Landing = loadable(() => import("./Landing"));
const ExplorePage = loadable(() => import("./ExplorePage"));
const RecordPage = loadable(() => import("./RecordPage"));
const SearchPage = loadable(() => import("./SearchPage"));
const AboutPage = loadable(() => import("./AboutPage"));
const TutorialPage = loadable(() => import("./TutorialPage"));

const basename = BASENAME || "";

const Main = (props) => {
  let css = classnames(
    // styles.flexCenter,
    // styles.flexCenterHorizontal,
    styles.fillParent
  );
  return (
    <Fragment>
      <Router className={css} basepath={basename} primary={false}>
        <Landing path="/" />
        <SearchPage path="/search" />
        <ExplorePage path="/explore" />
        <RecordPage path="/records" />
        <TutorialPage path="/tutorials" />
        <AboutPage path="/about" />
      </Router>
    </Fragment>
  );
};

export default compose(memo)(Main);
