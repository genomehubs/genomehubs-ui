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
  let pageDivs = [];
  if (pagination) {
    pageDivs.push(<SearchPagination key={"pagination"} />);
  }
  if (options) {
    pageDivs.push(<SearchOptions key={"options"} />);
  }

  return <div className={css}>{pageDivs}</div>;
};

export default compose(withSearch)(ControlPanel);
