import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withLocation from "../hocs/withLocation";
import styles from "./Styles.scss";
import loadable from "@loadable/component";

const Landing = loadable(() => import("./Landing"));
const InfoPage = loadable(() => import("./InfoPage"));

const Main = (props) => {
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

export default compose(withLocation)(Main);
