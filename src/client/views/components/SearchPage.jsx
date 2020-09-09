import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import SearchBox from "./SearchBox";
import withLocation from "../hocs/withLocation";
import withSearch from "../hocs/withSearch";

const SearchPage = ({ searchResultArray }) => {
  // console.log(searchResults);
  // console.log(searchResults.status);
  // console.log(searchResults.status.success);
  // console.log(searchResults.results);
  // if (searchResults.status && searchResults.status.success) {
  //   searchResults.results.forEach((result) => {
  //     console.log(result);
  //     results.push(<ResultPanel recordId={result.id} {...result.result} />);
  //   });
  // }
  let results = [];
  searchResultArray.forEach((result) => {
    results.push(<ResultPanel key={result.id} {...result} />);
  });
  console.log(results);
  return (
    <div className={styles.infoPage}>
      <SearchBox />
      <div
        className={classnames(
          styles.flexCenter,
          styles.flexCenterHorizontal,
          styles.fullWidth
        )}
      >
        {results}
      </div>
    </div>
  );
};

export default compose(withLocation, withSearch)(SearchPage);
