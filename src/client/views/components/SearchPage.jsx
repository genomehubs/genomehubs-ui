import React, { memo, useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import ResultPanel from "./ResultPanel";
import ResultTable from "./ResultTable";
import TextPanel from "./TextPanel";
import SearchBox from "./SearchBox";
// import ControlPanel from "./ControlPanel";
import withSetLookup from "../hocs/withSetLookup";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import { shallowEqualObjects } from "shallow-equal";
import qs from "qs";
import { useNavigate } from "@reach/router";

const SearchPage = ({
  searchResults,
  searchResultArray,
  setLookupTerm,
  searchTerm,
  setSearchTerm,
  fetchSearchResults,
  setRecordId,
}) => {
  let results = [];
  const navigate = useNavigate();
  let options = qs.parse(location.search.replace(/^\?/, ""));
  let hashTerm = decodeURIComponent(location.hash.replace(/^\#/, ""));
  useEffect(() => {
    if (options.query && !shallowEqualObjects(options, searchTerm)) {
      if (options.query != searchTerm.query) {
        fetchSearchResults(options);
      }
    } else if (searchTerm.query && !options.query) {
      setSearchTerm({});
      fetchSearchResults({});
    }
    if (hashTerm) {
      setLookupTerm(hashTerm);
    }
  }, [options, hashTerm]);
  // searchResultArray.forEach((result) => {
  //   results.push(<ResultPanel key={result.id} {...result} />);
  // });
  results = <ResultTable />;
  let controls;
  // if (searchResults.status && searchResults.status.hits) {
  //   controls = <ControlPanel pagination options />;
  // }

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

export default compose(memo, withSetLookup, withSearch, withRecord)(SearchPage);
