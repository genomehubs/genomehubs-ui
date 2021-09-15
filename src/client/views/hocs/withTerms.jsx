import React from "react";
import { connect } from "react-redux";
import { getSuggestedTerms } from "../selectors/search";

const withTerms = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    terms: getSuggestedTerms(state),
  });

  const Connected = connect(mapStateToProps)(WrappedComponent);

  return <Connected {...props} />;
};

export default withTerms;
