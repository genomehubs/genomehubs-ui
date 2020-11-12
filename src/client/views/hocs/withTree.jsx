import React from "react";
import { connect } from "react-redux";
import {
  getNodes,
  getRootNode,
  resetNodes,
  setRootNode,
} from "../reducers/tree";
import { getTreeNodes, fetchNodes, getTreeRings } from "../selectors/tree";

const withTree = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    nodes: getNodes(state),
    treeNodes: getTreeNodes(state),
    treeRings: getTreeRings(state),
    rootNode: getRootNode(state),
    // ...(props.recordId && {
    //   searchById: getSearchResultById(state, props.recordId),
    // }),
  });

  const mapDispatchToProps = (dispatch) => ({
    fetchNodes: (options) => {
      if (options.query && options.query.length > 0) {
        dispatch(fetchNodes(options));
      } else {
        dispatch(resetNodes());
      }
    },
    setRootNode: (id) => dispatch(setRootNode(id)),
  });

  const Connected = connect(
    mapStateToProps,
    mapDispatchToProps
  )(WrappedComponent);

  return <Connected {...props} />;
};

export default withTree;
