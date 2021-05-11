import { fetchReport } from "../selectors/report";

import React from "react";
import { connect } from "react-redux";

const dispatchReport = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({});

  const mapDispatchToProps = (dispatch) => ({
    fetchReport: (reportId, queryString, reload) =>
      dispatch(fetchReport(reportId, queryString, reload)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default dispatchReport;
