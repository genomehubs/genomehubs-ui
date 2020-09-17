import React from "react";
import { connect } from "react-redux";
import {
  fetchSummary,
  getSummaryField,
  setSummaryField,
} from "../reducers/explore";

const withSummary = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    summaryField: getSummaryField(state),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchSummary: (taxon, field, summary, result = "taxon") => {
      dispatch(fetchSummary(taxon, field, summary, result));
    },
    setSummaryField: (field) => dispatch(setSummaryField(field)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withSummary;