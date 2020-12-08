import React, { memo, useEffect } from "react";

import ResultTable from "./ResultTable";
import SearchBox from "./SearchBox";
import SearchSummary from "./SearchSummary";
import TextPanel from "./TextPanel";
import TreePanel from "./TreePanel";
import classnames from "classnames";
import { compose } from "recompose";
import qs from "qs";
import shallow from "shallowequal";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSetLookup from "../hocs/withSetLookup";

const SearchPage = ({
  searchResults,
  searchResultArray,
  setLookupTerm,
  searchTerm,
  setSearchTerm,
  setSearchIndex,
  preferSearchTerm,
  setPreferSearchTerm,
  previousSearchTerm,
  setPreviousSearchTerm,
  fetchSearchResults,
  setRecordId,
}) => {
  let results = [];
  const navigate = useNavigate();
  let options = qs.parse(location.search.replace(/^\?/, ""));
  let hashTerm = decodeURIComponent(location.hash.replace(/^\#/, ""));
  let isFetching = searchResults.isFetching;
  useEffect(() => {
    if (!isFetching) {
      if (options.query && !shallow(options, searchTerm)) {
        if (preferSearchTerm) {
          if (!shallow(searchTerm, previousSearchTerm)) {
            setPreviousSearchTerm(searchTerm);
            setSearchIndex(options.result);
            fetchSearchResults(searchTerm);
          }
          // options = { ...searchTerm };
          // setPreferSearchTerm(false);
          // navigate(`search?${qs.stringify(searchTerm)}${location.hash}`);
        } else {
          let hashedNav = (path) => {
            let from = `search?${qs.stringify(previousSearchTerm)}${
              location.hash
            }`;
            let to = `${path}#${encodeURIComponent(hashTerm)}`;
            if (to != from) {
              navigate(to);
            }
          };
          if (!shallow(options, previousSearchTerm)) {
            setPreviousSearchTerm(options);
            setSearchIndex(options.result);
            fetchSearchResults(options, hashedNav);
          }
        }

        // }
      } else if (searchTerm.query && !options.query) {
        setPreviousSearchTerm({});
        setSearchTerm({});
        setSearchIndex("multi");
        fetchSearchResults({});
      }
      if (hashTerm) {
        setLookupTerm(hashTerm);
      }
    }
  }, [options, hashTerm, isFetching]);
  let summary;
  if (searchResults.status && searchResults.status.hasOwnProperty("hits")) {
    summary = <SearchSummary />;
  }
  results = <ResultTable />;

  let tree = <TreePanel></TreePanel>;
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
        {summary}
        {results}
        {tree}
        {text}
      </div>
    </div>
  );
};

export default compose(memo, withSetLookup, withSearch, withRecord)(SearchPage);
