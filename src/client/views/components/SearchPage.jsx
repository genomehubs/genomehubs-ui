import React, { memo, useEffect } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import TreePanel from "./TreePanel";
import ResultTable from "./ResultTable";
import TextPanel from "./TextPanel";
import SearchBox from "./SearchBox";
import SearchSummary from "./SearchSummary";
import withSetLookup from "../hocs/withSetLookup";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import shallow from "shallowequal";
import qs from "qs";
import { useNavigate } from "@reach/router";

const SearchPage = ({
  searchResults,
  searchResultArray,
  setLookupTerm,
  searchTerm,
  setSearchTerm,
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
            let to = `${path}#${hashTerm}`;
            if (to != from) {
              navigate(to);
            }
          };
          if (!shallow(options, previousSearchTerm)) {
            setPreviousSearchTerm(options);
            fetchSearchResults(options, hashedNav);
          }
        }

        // }
      } else if (searchTerm.query && !options.query) {
        setPreviousSearchTerm({});
        setSearchTerm({});
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
