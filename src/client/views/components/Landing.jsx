import React, { memo, useRef } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import useResize from "../hooks/useResize";
import withPanes from "../hocs/withPanes";
import styles from "./Styles.scss";
import loadable from "@loadable/component";
const SearchBox = loadable(() => import("./SearchBox"));
const InfoPanel = loadable(() => import("./InfoPanel"));
const TextPanel = loadable(() => import("./TextPanel"));

const Landing = (props) => {
  let css = classnames(
    styles.landing,
    styles.flexCenter,
    styles.flexCenterHorizontal
  );
  const componentRef = useRef();
  const { width, height } = useResize(componentRef);
  let firstPanel;
  let morePanels;
  if (props.panes.length > 0) {
    let count = Math.min(Math.floor(width / 380), 3);
    if (count > 1) {
      morePanels = [];
      firstPanel = (
        <InfoPanel panes={props.panes.slice(0, count)} cols={count} />
      );
      for (let i = count; i < props.panes.length; i += count) {
        let cols = Math.min(props.panes.length - 1, count);
        morePanels.push(
          <InfoPanel
            key={i}
            panes={props.panes.slice(i, i + count)}
            cols={cols}
          />
        );
      }
    }
  }

  let text = <TextPanel view={"about"}></TextPanel>;
  return (
    <div ref={componentRef} className={css}>
      {firstPanel}
      <SearchBox />
      {morePanels}
      {text}
    </div>
  );
};

export default compose(memo, withPanes)(Landing);
