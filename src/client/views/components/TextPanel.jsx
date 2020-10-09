import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { formatter } from "../functions/formatter";
import withPanes from "../hocs/withPanes";
import Tooltip from "@material-ui/core/Tooltip";

const TextPanel = ({ view, panes, children }) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.textPanel
  );

  let page;
  if (panes) {
    page = panes.filter((obj) => obj.view == view);
    page = page[0];
  }
  if (!page) {
    return null;
  }
  return (
    <div className={css}>
      <div className={styles.header}>
        <span className={styles.title}>{page.title}</span>
      </div>

      <div>{children ? children : page.text}</div>
    </div>
  );
};

export default compose(withPanes)(TextPanel);
