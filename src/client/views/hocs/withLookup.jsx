import React from "react";
import { connect } from "react-redux";
import {
  getLookupTerm,
  setLookupTerm,
  getLookupTerms,
  fetchLookup,
  resetLookup,
} from "../reducers/lookup";

const withLookup = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    lookupTerm: getLookupTerm(state),
    lookupTerms: getLookupTerms(state),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchLookup: (searchTerm, result) => {
      if (searchTerm.length > 3) {
        dispatch(fetchLookup(searchTerm, result));
      } else {
        dispatch(resetLookup());
      }
    },
    setLookupTerm: (searchTerm) => dispatch(setLookupTerm(searchTerm)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withLookup;
