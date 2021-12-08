import React from "react";
import { connect } from "react-redux";
import { fetchReport } from "../selectors/report";

const dispatchReport = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({});

  const mapDispatchToProps = (dispatch) => ({
    fetchReport: ({ reportId, queryString, reload, report }) =>
      dispatch(fetchReport({ reportId, queryString, reload, report })),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default dispatchReport;
