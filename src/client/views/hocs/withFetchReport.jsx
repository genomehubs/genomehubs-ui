import React from "react";
import { connect } from "react-redux";
import { fetchReport } from "../selectors/report";

const withFetchReport = (WrappedComponent) => (props) => {
  const mapDispatchToProps = (dispatch) => ({
    fetchReport: (props) => {
      dispatch(fetchReport(props));
    },
  });

  const Connected = connect(undefined, mapDispatchToProps)(WrappedComponent);

  return <Connected {...props} />;
};

export default withFetchReport;
