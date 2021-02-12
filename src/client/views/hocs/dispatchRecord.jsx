import { fetchRecord, setCurrentRecordId } from "../reducers/record";

import React from "react";
import { connect } from "react-redux";

const dispatchRecord = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({});

  const mapDispatchToProps = (dispatch) => ({
    fetchRecord: (recordId, result) => dispatch(fetchRecord(recordId, result)),
    setRecordId: (recordId) => dispatch(setCurrentRecordId(recordId)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default dispatchRecord;
