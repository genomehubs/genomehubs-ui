import React, { memo, useEffect } from "react";

import Page from "./Page";
import ResultTable from "./ResultTable";
import SearchSummary from "./SearchSummary";
import TextPanel from "./TextPanel";
import TreePanel from "./TreePanel";
import classnames from "classnames";
import { compose } from "recompose";
import equal from "deep-equal";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withLookup from "../hocs/withLookup";
import withRecord from "../hocs/withRecord";
import withSearch from "../hocs/withSearch";
import withSetLookup from "../hocs/withSetLookup";

const SearchPage = ({
  searchResults,
  searchResultArray,
  setLookupTerm,
  // lookupTerm,
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
  let values = Object.values(options);
  useEffect(() => {
    if (!isFetching) {
      if (options.query && !equal(options, searchTerm)) {
        if (preferSearchTerm) {
          if (!equal(searchTerm, previousSearchTerm)) {
            setPreviousSearchTerm(searchTerm);
            setSearchIndex(options.result);
            setLookupTerm(hashTerm);
            fetchSearchResults(searchTerm);
          }
        } else {
          if (Object.keys(previousSearchTerm).length > 0) {
            let hashedNav = (path) => {
              let to = path;
              let from = `/search?${qs.stringify(previousSearchTerm)}`;
              if (to != from) {
                // navigate(`${path}#${encodeURIComponent(hashTerm)}`);
              }
            };
            if (!equal(options, previousSearchTerm)) {
              setPreviousSearchTerm(options);
              setSearchIndex(options.result);
              setLookupTerm(hashTerm);
              fetchSearchResults(options, hashedNav);
            }
          } else {
            let hashedNav = (path) => {
              // TODO: include taxonomy
              navigate(`${path}#${encodeURIComponent(hashTerm)}`);
            };
            setPreviousSearchTerm(options);
            setSearchIndex(options.result);
            setLookupTerm(hashTerm);
            fetchSearchResults(options, hashedNav);
          }
        }
      } else if (searchTerm.query && !options.query) {
        setPreviousSearchTerm({});
        setSearchTerm({});
        setSearchIndex("taxon");
        fetchSearchResults({});
      }
      // if (hashTerm != lookupTerm) {
      //   // setLookupTerm(hashTerm);
      // }
    }
  }, [values, hashTerm, isFetching]);
  let summary;
  let resultCount;
  if (searchResults.status && searchResults.status.hasOwnProperty("hits")) {
    resultCount = searchResults.isFetching ? -1 : searchResults.status.hits;
    // summary = <SearchSummary />;
  }
  results = <ResultTable />;

  let tree = <TreePanel></TreePanel>;
  let text = <TextPanel pageId={"search.md"}></TextPanel>;

  return (
    <Page
      searchBox
      panels={[
        // { panel: summary },
        { panel: results, maxWidth: "100%" },
        { panel: tree },
        { panel: text },
      ]}
      resultCount={resultCount}
    />
  );
};

export default compose(memo, withSetLookup, withSearch, withRecord)(SearchPage);
