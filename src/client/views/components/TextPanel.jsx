import React, { useEffect, Fragment } from "react";
import Markdown from "./Markdown";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { formatter } from "../functions/formatter";
import withPanes from "../hocs/withPanes";
import Tooltip from "@material-ui/core/Tooltip";

const TextPanel = ({ view, pageId, panes, children }) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.textPanel
  );
  return (
    <div className={css}>
      <Markdown pageId={pageId} />
    </div>
  );
  // let page;
  // if (panes && !markdown) {
  //   page = panes.filter((obj) => obj.view == view);
  //   page = page[0];
  // }
  // if (!page && !markdown) {
  //   return null;
  // }
  // return (
  //   <div className={css}>
  //     {(page && (
  //       <Fragment>
  //         <div className={styles.header}>
  //           <span className={styles.title}>{page.title}</span>
  //         </div>

  //         <div>{children ? children : page.text}</div>
  //       </Fragment>
  //     )) || { markdown }}
  //   </div>
  // );
};

export default compose(withPanes)(TextPanel);
