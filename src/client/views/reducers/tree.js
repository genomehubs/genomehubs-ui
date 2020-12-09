import { createAction, handleAction, handleActions } from "redux-actions";

import { createCachedSelector } from "re-reselect";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import qs from "qs";

export const apiUrl = API_URL || "/api/v1";

export const requestNodes = createAction("REQUEST_NODES");
export const receiveNodes = createAction("RECEIVE_NODES");
export const cancelNodesRequest = createAction("CANCEL_NODES_REQUEST");
export const resetNodes = createAction("RESET_NODES");

const defaultState = () => ({
  isFetching: false,
  byId: {},
});

const nodes = handleActions(
  {
    REQUEST_NODES: (state, action) =>
      immutableUpdate(state, {
        isFetching: true,
      }),
    CANCEL_NODES_REQUEST: (state, action) =>
      immutableUpdate(state, {
        isFetching: false,
      }),
    RECEIVE_NODES: (state, action) => {
      let byId = {};
      action.payload.results.forEach((obj) => {
        byId[obj.result.taxon_id] = obj.result;
      });
      return {
        isFetching: false,
        status: action.payload.status,
        byId: { ...state.byId, ...byId },
      };
    },
    RESET_NODES: defaultState,
  },
  defaultState()
);

export const getNodes = (state) => state.nodes.byId;

export const setRootNode = createAction("SET_ROOT_NODE");
export const rootNode = handleAction(
  "SET_ROOT_NODE",
  (state, action) => action.payload,
  null
);
export const getRootNode = (state) => state.rootNode;

export const setTreeHighlight = createAction("SET_TREE_HIGHLIGHT");
export const treeHighlight = handleAction(
  "SET_TREE_HIGHLIGHT",
  (state, action) => action.payload,
  { field: "assembly_span", condition: undefined, value: undefined }
);
export const getTreeHighlight = (state) => state.treeHighlight;

export const setTreeQuery = createAction("SET_TREE_QUERY");
export const treeQuery = handleAction(
  "SET_TREE_QUERY",
  (state, action) => action.payload,
  null
);
export const getTreeQuery = (state) => state.treeQuery;

export const treeReducers = {
  nodes,
  rootNode,
  treeHighlight,
  treeQuery,
};
