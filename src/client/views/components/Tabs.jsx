import React, { memo } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withFadeInOut from "../hocs/withFadeInOut";
import Markdown from "./Markdown";
// import withPages from "../hocs/withPages";
import dispatchRoutes from "../hocs/dispatchRoutes";
import styles from "./Styles.scss";
import Tab from "./Tab";

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
