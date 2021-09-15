import React, { memo } from "react";

import Markdown from "./Markdown";
import Tab from "./Tab";
import classnames from "classnames";
import { compose } from "recompose";
// import withPages from "../hocs/withPages";
import dispatchRoutes from "../hocs/dispatchRoutes";
import styles from "./Styles.scss";
import withFadeInOut from "../hocs/withFadeInOut";

const Tabs = ({ setRoute }) => {
  let css = classnames(styles.tabHolder);
  // let show = { help: true, about: true, search: true };
  let tabs = [];
  const components = {
    ul: (props) => {
      return <nav className={css}>{props.children}</nav>;
    },
    li: (props) => {
      let routeName = props.children[0].replace(/\n$/, "");
      return <Tab routeName={routeName} pageId={`${routeName}.md`} />;
    },
  };
  return (
    <Markdown pageId={"tabs.md"} components={components} siteStyles={true} />
  );
};

export default compose(dispatchRoutes)(Tabs);
