import React, { useState } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import withLocation from "../hocs/withLocation";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import styles from "./Styles.scss";

const siteName = SITENAME || "GenomeHub";

const SearchBox = ({
  chooseView,
  lookupTerm,
  setLookupTerm,
  resetLookup,
  lookupTerms,
  fetchLookup,
  fetchSearchResults,
}) => {
  const doSearch = (query, result = "taxon") => {
    fetchSearchResults({ query, result });
    chooseView("search");
    resetLookup();
  };
  const updateSearch = (query, result = "taxon") => {
    fetchSearchResults({ query, result });
    chooseView("search");
    setLookupTerm(query);
    setTimeout(resetLookup, 100);
  };
  const updateTerm = (value, result = "taxon") => {
    setLookupTerm(value);
    fetchLookup(value, result);
  };
  const handleChange = (e) => {
    updateTerm(e.currentTarget.value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      doSearch(e.currentTarget.value);
    }
  };

  let terms;
  if (
    lookupTerms.status &&
    lookupTerms.status.success &&
    lookupTerms.results &&
    lookupTerms.results.length > 0 &&
    !/[\(\)<>=]/.test(lookupTerm)
  ) {
    terms = [];
    lookupTerms.results.forEach((result, i) => {
      let value;
      if (result.reason) {
        value = result.reason[0].fields["taxon_names.name.raw"][0];
      } else {
        value = result.result.scientific_name;
      }
      terms.push(
        <div
          key={i}
          className={styles.term}
          onClick={() => updateSearch(value)}
        >
          <span className={styles.value}>{value}</span>
          <div
            className={styles.extra}
          >{`\u2014 ${result.result.taxon_rank}`}</div>
        </div>
      );
    });
  }
  let suggestions;
  if (
    lookupTerms.status &&
    lookupTerms.status.success &&
    lookupTerms.suggestions &&
    lookupTerms.suggestions.length > 0 &&
    !/[\(\)<>=]/.test(lookupTerm)
  ) {
    suggestions = [<div key={"x"}>Did you mean:</div>];
    lookupTerms.suggestions.forEach((suggestion, i) => {
      let value = suggestion.suggestion.text;
      suggestions.push(
        <div key={i} className={styles.term} onClick={() => updateTerm(value)}>
          <span className={styles.value}>{value}</span>?
        </div>
      );
    });
  }
  return (
    <div
      className={styles.flexColumn}
      style={{
        height: "6em",
        minWidth: "600px",
        overflow: "visible",
        zIndex: 10,
      }}
    >
      <div
        className={styles.fullWidth}
        style={{
          textAlign: "center",
        }}
      >
        <input
          type="text"
          placeholder={`Search ${siteName}`}
          className={classnames(styles.searchBox, styles.fullWidth)}
          value={lookupTerm}
          onChange={handleChange}
          onKeyPress={handleKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        ></input>
      </div>
      {(terms || suggestions) && (
        <div className={styles.completion}>
          {terms}
          {suggestions}
        </div>
      )}
    </div>
  );
};

export default compose(withLocation, withSearch, withLookup)(SearchBox);
