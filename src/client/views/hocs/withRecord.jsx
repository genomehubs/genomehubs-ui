import {
  fetchRecord,
  getCurrentRecord,
  getCurrentRecordId,
  getRecordIsFetching,
  setCurrentRecordId,
} from "../reducers/record";

import React from "react";
import { connect } from "react-redux";
import { getLineage } from "../selectors/record";

const withRecord = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    record: getCurrentRecord(state),
    recordIsFetching: getRecordIsFetching(state),
    recordId: getCurrentRecordId(state),
    lineage: getLineage(state),
  });

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

export default withRecord;
