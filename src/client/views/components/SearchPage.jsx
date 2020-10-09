import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import TextPanel from "./TextPanel";
import SearchBox from "./SearchBox";
import ControlPanel from "./ControlPanel";
import withLocation from "../hocs/withLocation";
import withSearch from "../hocs/withSearch";

const SearchPage = ({ searchResults, searchResultArray }) => {
  let results = [];
  searchResultArray.forEach((result) => {
    results.push(<ResultPanel key={result.id} {...result} />);
  });
  let controls;
  if (searchResults.status && searchResults.status.hits) {
    controls = <ControlPanel pagination options />;
  }

  let text = <TextPanel view={"search"}></TextPanel>;

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
        {controls}
        {text}
      </div>
    </div>
  );
};

export default compose(withLocation, withSearch)(SearchPage);
