import React, { memo } from "react";
import { compose } from "recompose";
import styles from "./Styles.scss";

import { Link } from "@reach/router";

const siteName = SITENAME || "/";

const SiteName = () => {
  return (
    <Link className={styles.siteName} to="/view/">
      {siteName}
    </Link>
  );
};

export default compose(memo)(SiteName);
