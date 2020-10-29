import React, { memo } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { Link, useLocation } from "@reach/router";

const NavLink = (props) => {
  let parts = props.pathname.split("/");
  parts[2] = props.destination;
  let to = parts.join("/") + props.search;
  return (
    <Link
      {...props}
      to={to}
      getProps={({ isCurrent }) => {
        let css = classnames(styles.tab, { [styles.tabHighlight]: isCurrent });
        return {
          className: css,
        };
      }}
    />
  );
};

const Tab = (props) => {
  const location = useLocation();
  return (
    <NavLink
      pathname={location.pathname}
      search={location.search}
      destination={props.view}
    >
      {props.short}
    </NavLink>
  );
};

export default compose()(Tab);
