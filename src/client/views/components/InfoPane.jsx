import React, { useState } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withLocation from "../hocs/withLocation";
import styles from "./Styles.scss";
import { makeStyles } from "@material-ui/core/styles";
import loadable from "@loadable/component";

const InfoCard = loadable(() => import("./InfoCard"));

// const useStyles = makeStyles({
//   root: {
//     width: "100%",
//     height: "100%",
//     display: "flex",
//     position: "absolute",
//     top: 0,
//     left: 0,
//   },
//   details: {
//     // display: "flex",
//     // flexDirection: "column",
//   },
//   content: {
//     flex: "1 0 auto",
//   },
//   cover: {
//     position: "absolute",
//     top: "3rem",
//     bottom: 0,
//     width: "100%",
//     height: "calc(100% - 3rem)",
//     transition: "all 0s ease-in 0s",
//   },
// });

const InfoPane = (props) => {
  const [hover, setHover] = useState(false);
  // {paneWidth, title, image, text, fullText}
  const handleClick = () => {
    props.chooseView(props.view);
  };
  let highlight = props.views.primary == props.view;
  let css = classnames(
    styles.flexCenter,
    styles.flexCenterHorizontal,
    styles.infoPane,
    styles.infoPaneDefault,
    { [styles.infoPaneHighlight]: highlight },
    styles.fixedAr,
    styles.fixedArSixteenNine
  );
  let placeholder;
  if (props.image) {
    placeholder = props.image;
  } else {
    placeholder = "placeholder.png";
  }
  let desc_css = classnames(styles.fillParent, styles.infoPaneDescription, {
    [styles.infoPaneHoverReveal]: hover,
  });
  return (
    <div
      className={css}
      onClick={handleClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <InfoCard {...props} />
    </div>
  );
  return (
    <div
      className={css}
      onClick={handleClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <div className={styles.infoPaneHeader}>{props.title}</div>
      <div
        className={styles.infoPaneContent}
        style={{ backgroundImage: `url(${images[placeholder]})` }}
      >
        <div className={desc_css}>{props.text || ""}</div>
      </div>
    </div>
  );
};

export default compose(React.memo, withLocation)(InfoPane);
