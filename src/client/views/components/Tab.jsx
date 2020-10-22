import React, { memo } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";

import { Link, Location } from "@reach/router";

const NavLink = (props) => {
  let parts = props.pathname.split("/");
  parts[2] = props.destination;
  let to = parts.join("/");
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
  return (
    <Location>
      {({ location }) => (
        <NavLink pathname={location.pathname} destination={props.view}>
          {props.short}
        </NavLink>
      )}
    </Location>
  );
};

export default compose(memo)(Tab);
