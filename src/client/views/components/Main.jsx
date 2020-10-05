import React, { useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withLocation from "../hocs/withLocation";
import withTypes from "../hocs/withTypes";
import styles from "./Styles.scss";
import Landing from "./Landing";
import InfoPage from "./InfoPage";

const Main = (props) => {
  useEffect(() => {
    if (Object.keys(props.types).length == 0) {
      props.fetchTypes("taxon");
    }
  }, []);
  let content;
  if (props.views.primary == "landing") {
    content = <Landing />;
  } else {
    content = <InfoPage />;
  }
  let css = classnames(
    styles.flexCenter,
    styles.flexCenterHorizontal,
    styles.fillParent
  );
  return <main className={css}>{content}</main>;
};

export default compose(withTypes, withLocation)(Main);
