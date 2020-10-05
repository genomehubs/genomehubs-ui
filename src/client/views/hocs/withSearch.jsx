import React from "react";
import { connect } from "react-redux";
import {
  getSearchTerm,
  setSearchTerm,
  getSearchResults,
  getSearchResultArray,
  fetchSearchResults,
  getSearchResultById,
  resetSearch,
} from "../reducers/search";

const withSearch = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    searchTerm: getSearchTerm(state),
    searchResults: getSearchResults(state),
    searchResultArray: getSearchResultArray(state),
    ...(props.recordId && {
      searchById: getSearchResultById(state, props.recordId),
    }),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchSearchResults: (options) => {
      if (options.query && options.query.length > 0) {
        dispatch(fetchSearchResults(options));
      } else {
        dispatch(resetSearch());
      }
    },
    setSearchTerm: (options) => dispatch(setSearchTerm(options)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withSearch;
