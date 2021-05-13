import React, { Fragment, memo } from "react";

import { Router } from "@reach/router";
import classnames from "classnames";
import { compose } from "recompose";
import loadable from "@loadable/component";
import styles from "./Styles.scss";
import withRoutes from "../hocs/withRoutes";

const Landing = loadable(() => import("./Landing"));
const ExplorePage = loadable(() => import("./ExplorePage"));
const RecordPage = loadable(() => import("./RecordPage"));
const ReportPage = loadable(() => import("./ReportPage"));
const SearchPage = loadable(() => import("./SearchPage"));
const GenericPage = loadable(() => import("./GenericPage"));
// const AboutPage = loadable(() => import("./AboutPage"));
// const TutorialPage = loadable(() => import("./TutorialPage"));

const basename = BASENAME || "";

const fixedRoutes = { search: true, explore: true, records: true };

const Main = ({ routes }) => {
  let css = classnames(
    // styles.flexCenter,
    // styles.flexCenterHorizontal,
    styles.fillParent
  );
  let paths = [
    <Landing path="/" />,
    <SearchPage path="/search" />,
    <ExplorePage path="/explore" />,
    <RecordPage path="/records" />,
    <ReportPage path="/report" />,
  ];
  routes.allIds.forEach((routeName) => {
    if (!fixedRoutes[routeName]) {
      paths.push(
        <GenericPage
          path={`/${routeName}`}
          pageId={routes.byId[routeName].pageId}
        />
      );
    }
    paths.push(
      <GenericPage
        path={`/${routeName}/*`}
        // pageId={routes.byId[routeName].pageId}
      />
    );
  });
  return (
    <Fragment>
      <Router className={css} basepath={basename} primary={false}>
        {paths}
      </Router>
    </Fragment>
  );
};

export default compose(memo, withRoutes)(Main);
