import {
  resetSearch,
  saveSearchResults,
  setPreferSearchTerm,
  setPreviousSearchTerm,
  setSearchIndex,
  setSearchTerm,
} from "../reducers/search";

import React from "react";
import { connect } from "react-redux";
import { fetchSearchResults } from "../selectors/search";

const dispatchSearch = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({});

  const mapDispatchToProps = (dispatch) => ({
    fetchSearchResults: (options, navigate) => {
      if (options.query && options.query.length > 0) {
        dispatch(fetchSearchResults(options, navigate));
      } else {
        dispatch(resetSearch());
      }
    },
    setSearchTerm: (options) => dispatch(setSearchTerm(options)),
    setSearchIndex: (index) => dispatch(setSearchIndex(index)),
    setPreferSearchTerm: (bool) => dispatch(setPreferSearchTerm(bool)),
    setPreviousSearchTerm: (options) =>
      dispatch(setPreviousSearchTerm(options)),
    saveSearchResults: (options, format) => saveSearchResults(options, format),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default dispatchSearch;
