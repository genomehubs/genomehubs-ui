import React, { memo } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import { Router } from "@reach/router";

import styles from "./Styles.scss";
import loadable from "@loadable/component";
const Landing = loadable(() => import("./Landing"));
const ExplorePage = loadable(() => import("./ExplorePage"));
const RecordPage = loadable(() => import("./RecordPage"));
const SearchPage = loadable(() => import("./SearchPage"));
const AboutPage = loadable(() => import("./AboutPage"));
const TutorialPage = loadable(() => import("./TutorialPage"));

const basename = BASENAME || "view";

const Main = (props) => {
  let css = classnames(
    styles.flexCenter,
    styles.flexCenterHorizontal,
    styles.fillParent
  );
  return (
    <main className={css}>
      <Router className={css} basepath={basename}>
        <Landing path="/" />
        <SearchPage path="/search" />
        <ExplorePage path="/explore" />
        <RecordPage path="/records" />
        <TutorialPage path="/tutorials" />
        <AboutPage path="/about" />
      </Router>
    </main>
  );
};

export default compose(memo)(Main);
