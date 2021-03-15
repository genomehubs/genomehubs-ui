import { Link, useLocation } from "@reach/router";
import React, { memo } from "react";

import classnames from "classnames";
import { compose } from "recompose";
import styles from "./Styles.scss";

const NavLink = (props) => {
  let parts = props.pathname.split("/");
  parts[2] = props.destination;
  let to = "/" + parts.join("/") + props.search + props.hash;
  to = "/" + props.destination + props.search + props.hash;
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
      hash={location.hash}
      destination={props.view}
    >
      {props.short}
    </NavLink>
  );
};

export default compose()(Tab);
