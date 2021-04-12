import React from "react";
import { connect } from "react-redux";
import { fetchReport } from "../selectors/report";

const withFetchReport = (WrappedComponent) => (props) => {
  const mapDispatchToProps = (dispatch) => ({
    fetchReport: ({ reportId, terms, reportType, result }) => {
      dispatch(fetchReport({ reportId, terms, reportType, result }));
    },
  });

  const Connected = connect(undefined, mapDispatchToProps)(WrappedComponent);

  return <Connected {...props} />;
};

export default withFetchReport;
