import React from "react";
import { connect } from "react-redux";
import {
  getSearchTerm,
  setSearchTerm,
  getSearchResults,
  getSearchResultArray,
  fetchSearchResults,
  resetSearch,
} from "../reducers/search";

const withSearch = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    searchTerm: getSearchTerm(state),
    searchResults: getSearchResults(state),
    searchResultArray: getSearchResultArray(state),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchSearchResults: (searchTerm, result) => {
      if (searchTerm.length > 0) {
        dispatch(fetchSearchResults(searchTerm, result));
      } else {
        dispatch(resetSearch());
      }
    },
    setSearchTerm: (searchTerm) => dispatch(setSearchTerm(searchTerm)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withSearch;
