import React from "react";
import { connect } from "react-redux";
import {
  getRecords,
  getCurrentRecord,
  fetchRecord,
  getCurrentRecordId,
  setCurrentRecordId,
  resetRecord,
} from "../reducers/record";

const withRecord = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    record: getCurrentRecord(state),
    recordId: getCurrentRecordId(state),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchRecord: (recordId) => dispatch(fetchRecord(recordId)),
    setRecordId: (recordId) => dispatch(setCurrentRecordId(recordId)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withRecord;
