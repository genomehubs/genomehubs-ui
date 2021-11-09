import React, { Fragment, memo, useRef } from "react";

import Page from "./Page";
import TextPanel from "./TextPanel";
import { compose } from "recompose";
import useResize from "../hooks/useResize";
import withPanes from "../hocs/withPanes";

const Landing = (props) => {
  const componentRef = useRef();
  const { width, height } = useResize(componentRef);
  let panels = [];
  let text = <TextPanel view={"about"} pageId={"landing.md"}></TextPanel>;
  panels.push({ panel: text, minWidth: "80%" });
  return <Page searchBox panels={panels} pageRef={componentRef} />;
};

export default compose(memo, withPanes)(Landing);
