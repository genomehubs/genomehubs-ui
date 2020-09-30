import { createAction, handleAction, handleActions } from "redux-actions";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import { setApiStatus } from "./api";
import { byIdSelectorCreator } from "./selectorCreators";
import { createCachedSelector } from "re-reselect";
import { interpolateGreens } from "d3-scale-chromatic";
import { scaleLinear, scaleLog, scaleSqrt } from "d3-scale";
import { format } from "d3-format";
import store from "../store";

const apiUrl = API_URL || "/api/v1";

const requestTypes = createAction("REQUEST_TYPES");
const receiveTypes = createAction(
  "RECEIVE_TYPES",
  (json) => json,
  () => ({ receivedAt: Date.now() })
);
export const resetTypes = createAction("RESET_TYPES");

const defaultState = () => ({
  isFetching: false,
  requestedById: {},
  byId: {
    assembly_span: {
      bins: {
        min: 6,
        max: 11,
        count: 10,
        scale: "log10",
      },
      type: "long",
      summary: ["count", "max", "min"],
    },
    c_value: {
      bins: {
        min: -2.5,
        max: 2.5,
        count: 10,
        scale: "log10",
      },
      type: "half_float",
      summary: ["count", "max", "min"],
    },
    c_value_method: {
      type: "keyword",
      summary: ["list"],
    },
    cell_type: {
      type: "keyword",
      summary: ["list"],
    },
    genome_size: {
      bins: {
        min: 6,
        max: 11,
        count: 10,
        scale: "log10",
      },
      type: "long",
      summary: ["count", "max", "min"],
    },
    sample_location: { type: "geo_point", fields: ["count"] },
    sample_sex: { type: "keyword", fields: ["count"] },
  },
});

function onReceiveTypes(state, action) {
  // const { payload, meta } = action;
  // const { status, summaries } = payload;
  // const summary = summaries[0];
  // const id = `${summary.lineage}--${summary.field}--${summary.name}`;
  // const updatedWithSummaryState = immutableUpdate(state, {
  //   byId: { [id]: summary },
  // });
  // const updatedWithSummaryList = immutableUpdate(updatedWithSummaryState, {
  //   allIds: [...new Set(updatedWithSummaryState.allIds.concat(id))],
  // });
  // const updatedWithMeta = immutableUpdate(updatedWithSummaryList, {
  //   isFetching: false,
  //   status,
  //   lastUpdated: meta.receivedAt,
  // });
  // return updatedWithMeta;
}

const types = handleActions(
  {
    REQUEST_TYPES: (state, action) =>
      immutableUpdate(state, {
        isFetching: true,
        requestedById: immutableUpdate(state, {
          [action.payload]: true,
        }),
      }),
    RECEIVE_TYPES: onReceiveTypes,
    RESET_TYPES: defaultState,
  },
  defaultState()
);

export const getTypes = (state) => state.types.byId;

export const getTypesMap = createSelector(getTypes, (types) => types);

export const getTypesFetching = (state) => state.types.requestedById;

export function fetchTypes(lineage, field, summary, result) {
  return async function (dispatch) {
    // const state = store.getState();
    // const fetching = getSummariesFetching(state);
    // const summaries = getSummaries(state);
    // let id = `${lineage}--${field}--${summary}`;
    // if (summaries[id] || fetching[id]) {
    //   return;
    // }
    // dispatch(requestSummary(`${lineage}--${field}--${summary}`));
    // let url = `${apiUrl}/summary?recordId=${lineage}&result=${result}&summary=${summary}&fields=${field}`;
    // try {
    //   let json;
    //   try {
    //     const response = await fetch(url);
    //     json = await response.json();
    //   } catch (error) {
    //     json = console.log("An error occured.", error);
    //   }
    //   dispatch(receiveSummary(json));
    // } catch (err) {
    //   return dispatch(setApiStatus(false));
    // }
  };
}

export const typeReducers = {
  types,
};
