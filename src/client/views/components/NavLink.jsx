import { Link } from "@reach/router";
import React from "react";
import classnames from "classnames";
import styles from "./Styles.scss";
import { useLocation } from "@reach/router";

const NavLink = ({ to, tab, ...props }) => {
  const location = useLocation();
  if (to) {
    to = "/" + to + location.search + location.hash;
  } else if (props.href) {
    to = "/" + props.href + location.search + location.hash;
  }
  return (
    <Link
      {...props}
      to={to.replace(/\/+/, "/")}
      getProps={({ isCurrent }) => {
        let css = tab
          ? classnames(styles.tab, { [styles.tabHighlight]: isCurrent })
          : styles.link;
        return {
          className: css,
        };
      }}
    />
  );
};

export default NavLink;
