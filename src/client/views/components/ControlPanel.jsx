import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { format } from "d3-format";
import withSearch from "../hocs/withSearch";
import SearchOptions from "./SearchOptions";
import SearchPagination from "./SearchPagination";

const ControlPanel = ({
  fetchSearchResults,
  searchResults,
  searchResultArray,
  pagination,
  options,
}) => {
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel,
    styles.flexCenter,
    styles.flexCenterHorizontal,
    styles.fullWidth
  );
  let pageDiv;
  if (options) {
    pageDiv = <SearchOptions />;
  } else if (pagination && searchResults.status && searchResults.status.hits) {
    pageDiv = <SearchPagination />;
  }

  return <div className={css}>{pageDiv}</div>;
};

export default compose(withSearch)(ControlPanel);
