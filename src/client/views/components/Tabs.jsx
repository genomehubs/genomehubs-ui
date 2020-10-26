import React, { memo } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withFadeInOut from "../hocs/withFadeInOut";
import withPanes from "../hocs/withPanes";
import styles from "./Styles.scss";
import Tab from "./Tab";

const Tabs = (props) => {
  let css = classnames(styles.tabHolder);
  let tabs = props.panes.map((pane) => <Tab key={pane.short} {...pane} />);

  return <nav className={css}>{tabs}</nav>;
};

export default compose(memo, withPanes)(Tabs);
