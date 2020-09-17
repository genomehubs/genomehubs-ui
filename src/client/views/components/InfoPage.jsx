import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import withLocation from "../hocs/withLocation";
import withPanes from "../hocs/withPanes";
import CircularProgress from "@material-ui/core/CircularProgress";
import loadable from "@loadable/component";

const ExplorePage = loadable(() => import("./ExplorePage"));
const RecordPage = loadable(() => import("./RecordPage"));
const SearchPage = loadable(() => import("./SearchPage"));

const InfoPage = (props) => {
  if (!props.views.primary) {
    return null;
  }
  let page = props.panes.filter((obj) => obj.view == props.views.primary);
  page = page[0];
  if (!page) {
    return null;
  }
  if (page.id == "explorePane") {
    return <ExplorePage />;
  }
  if (page.id == "recordPane") {
    return <RecordPage />;
  }
  if (page.id == "searchPane") {
    return <SearchPage />;
  }
  return (
    <div className={styles.infoPage}>
      <h1>{page.title}</h1>
      <p>{page.text}</p>
    </div>
  );
};

export default compose(withLocation, withPanes)(InfoPage);
