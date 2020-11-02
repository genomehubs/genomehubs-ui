import React from "react";
import { connect } from "react-redux";
import { setLookupTerm, resetLookup } from "../reducers/lookup";

const withSetLookup = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({});

  const mapDispatchToProps = (dispatch) => ({
    setLookupTerm: (lookupTerm) => dispatch(setLookupTerm(lookupTerm)),
    resetLookup: () => dispatch(resetLookup()),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withSetLookup;
