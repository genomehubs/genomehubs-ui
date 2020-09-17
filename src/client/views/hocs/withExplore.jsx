import React from "react";
import { connect } from "react-redux";
import { fetchLineage, getLineage } from "../reducers/explore";

const withExplore = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    lineage: getLineage(state),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchLineage: (taxon, result) => {
      dispatch(fetchLineage(taxon, result));
    },
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withExplore;