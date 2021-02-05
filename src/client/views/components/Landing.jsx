import React, { memo, useRef } from "react";

import Page from "./Page";
// import classnames from "classnames";
import { compose } from "recompose";
import loadable from "@loadable/component";
// import styles from "./Styles.scss";
import useResize from "../hooks/useResize";
import withPanes from "../hocs/withPanes";

const InfoPanel = loadable(() => import("./InfoPanel"));
const TextPanel = loadable(() => import("./TextPanel"));

const Landing = (props) => {
  // let css = classnames(
  //   styles.landing,
  //   styles.flexCenter,
  //   styles.flexCenterHorizontal
  // );
  const componentRef = useRef();
  const { width, height } = useResize(componentRef);
  let panels = [];
  let morePanels;
  if (props.panes.length > 0) {
    let count = Math.min(Math.floor(width / 380), 3);
    if (count > 1) {
      panels.push({
        panel: <InfoPanel panes={props.panes.slice(0, count)} cols={count} />,
        minWidth: "80%",
      });
      for (let i = count; i < props.panes.length; i += count) {
        let cols = Math.min(props.panes.length - 1, count);
        panels.push({
          panel: (
            <InfoPanel
              key={i}
              panes={props.panes.slice(i, i + count)}
              cols={cols}
            />
          ),
          minWidth: "80%",
        });
      }
    }
  }

  let text = <TextPanel view={"about"}></TextPanel>;
  return <Page searchBox panels={panels} text={text} pageRef={componentRef} />;
};

export default compose(memo, withPanes)(Landing);
