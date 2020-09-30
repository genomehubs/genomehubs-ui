import React from "react";
import { connect } from "react-redux";
import { getTypesMap } from "../reducers/types";

const withTypes = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    types: getTypesMap(state),
  });

  const Connected = connect(mapStateToProps)(WrappedComponent);

  return <Connected {...props} />;
};

export default withTypes;
