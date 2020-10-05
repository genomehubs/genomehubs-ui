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
    fetchLookup: (lookupTerm, result) => {
      if (lookupTerm.length > 3) {
        dispatch(fetchLookup(lookupTerm, result));
      } else {
        dispatch(resetLookup());
      }
    },
    setLookupTerm: (lookupTerm) => dispatch(setLookupTerm(lookupTerm)),
    resetLookup: () => dispatch(resetLookup()),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withLookup;
