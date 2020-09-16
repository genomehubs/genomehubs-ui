import { createAction, handleAction, handleActions } from "redux-actions";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import { setApiStatus } from "./api";
import { byIdSelectorCreator } from "./selectorCreators";
import { createCachedSelector } from "re-reselect";
import { interpolateGreens } from "d3-scale-chromatic";
import { scaleLinear, scaleLog } from "d3-scale";
import { format } from "d3-format";
import store from "../store";

const apiUrl = API_URL || "/api/v1";

const requestSummary = createAction("REQUEST_SUMMARY");
const receiveSummary = createAction(
  "RECEIVE_SUMMARY",
  (json) => json,
  () => ({ receivedAt: Date.now() })
);
export const resetSummary = createAction("RESET_SUMMARY");

const defaultSummaryState = () => ({
  isFetching: false,
  requestedById: {},
  allIds: [],
  byId: {},
});

function onReceiveSummary(state, action) {
  const { payload, meta } = action;
  const { status, summaries } = payload;
  const summary = summaries[0];
  const id = `${summary.lineage}--${summary.field}--${summary.name}`;

  const updatedWithSummaryState = immutableUpdate(state, {
    byId: { [id]: summary },
  });

  const updatedWithSummaryList = immutableUpdate(updatedWithSummaryState, {
    allIds: [...new Set(updatedWithSummaryState.allIds.concat(id))],
  });

  const updatedWithMeta = immutableUpdate(updatedWithSummaryList, {
    isFetching: false,
    status,
    lastUpdated: meta.receivedAt,
  });

  return updatedWithMeta;
}

const summaries = handleActions(
  {
    REQUEST_SUMMARY: (state, action) =>
      immutableUpdate(state, {
        isFetching: true,
        requestedById: immutableUpdate(state, {
          [action.payload]: true,
        }),
      }),
    RECEIVE_SUMMARY: onReceiveSummary,
    RESET_SUMMARY: defaultSummaryState,
  },
  defaultSummaryState()
);

export const getSummaries = (state) => state.summaries.byId;
export const getSummariesFetching = (state) => state.summaries.requestedById;

export function fetchSummary(lineage, field, summary, result) {
  return async function (dispatch) {
    const state = store.getState();
    const fetching = getSummariesFetching(state);
    const summaries = getSummaries(state);
    let id = `${lineage}--${field}--${summary}`;
    if (summaries[id] || fetching[id]) {
      return;
    }
    dispatch(requestSummary(`${lineage}--${field}--${summary}`));
    let url = `${apiUrl}/summary?recordId=${lineage}&result=${result}&summary=${summary}&fields=${field}`;
    console.log(url);
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      dispatch(receiveSummary(json));
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}

const processSummary = (summaries, summaryId) => {
  let summary = summaries[summaryId];
  if (!summary) return {};
  if (summary.name == "histogram" && summary.field == "assembly_span") {
    let buckets = [];
    let ticks = [];
    const f = format(".2~s");
    const xDomain = [1000000, 100000000000];
    const xBinDomain = xDomain.map((x) => Math.log10(x));
    const xRange = [0, 1000];
    const xScale = scaleLinear().domain(xBinDomain).range(xRange);
    const xBinScale = scaleLog().domain(xDomain).range(xBinDomain).invert;
    const binCount = 10;
    const width = (xRange[1] - xRange[0]) / binCount;
    let underCount = 0;
    let overCount = 0;
    let max = 0;
    summary.summary.buckets.forEach((bucket) => {
      let bin = bucket.key;
      let count = 0;
      const x = xScale(bin);
      if (bin < xBinDomain[0]) {
        underCount += bucket.doc_count;
      } else if (bin >= xBinDomain[1]) {
        overCount += bucket.doc_count;
        if (bin == xBinDomain[1]) {
          let tick = { x, value: f(xBinScale(bin)) };
          ticks.push(tick);
        }
      } else {
        count = bucket.doc_count;
        let tick = { x, value: f(xBinScale(bin)) };
        if (bin == xBinDomain[0]) {
          count += underCount;
        }
        ticks.push(tick);
        buckets.push({
          bin,
          count,
          x,
          width,
          ...(bin > xBinDomain[0] && { min: xBinScale(bin) }),
          ...(bin < xBinDomain[1] && { max: xBinScale(bin + 0.5) }),
        });
        max = Math.max(max, count);
      }
    });
    if (overCount) {
      buckets[buckets.length - 1].count += overCount;
      max = Math.max(max, buckets[buckets.length - 1].count);
    }
    let lin = scaleLinear().domain([1, max]).range([0.25, 1]);
    let seq = interpolateGreens;
    buckets.forEach((bucket) => {
      if (bucket.count) {
        bucket.color = seq(lin(bucket.count));
      } else {
        bucket.color = "none";
      }
    });
    return { buckets, ticks };
  }
  return summary;
};

export const getSummaryBySummaryId = createCachedSelector(
  getSummaries,
  (_state, summaryId) => summaryId,
  (summaries, summaryId) => processSummary(summaries, summaryId)
)((_state, summaryId) => summaryId);

export const getHistograms = createSelector(getSummaries, (summaries) => {
  let histograms = {};
  summaries.allIds.forEach((id) => {
    let parts = id.split("--");
    if (parts[2] == "histogram") {
      if (!histograms[parts[0]]) {
        histograms[parts[0]] = {};
      }
      histograms[parts[0]][parts[1]] = summaries.byId[id];
    }
  });
  return histograms;
});

const requestLineage = createAction("REQUEST_LINEAGE");
const receiveLineage = createAction(
  "RECEIVE_LINEAGE",
  (json) => json,
  () => ({ receivedAt: Date.now() })
);
export const resetLineage = createAction("RESET_LINEAGE");

const defaultLineageState = () => ({
  isFetching: false,
  status: {},
  taxon: {},
  lineage: [],
});

const lineage = handleActions(
  {
    REQUEST_LINEAGE: (state, action) =>
      immutableUpdate(state, {
        isFetching: true,
      }),
    RECEIVE_LINEAGE: (state, action) => {
      const record = action.payload.records[0].record;
      return {
        isFetching: false,
        status: action.payload.status,
        taxon: {
          taxon_id: record.taxon_id,
          scientific_name: record.scientific_name,
          taxon_rank: record.taxon_rank,
        },
        lineage: record.lineage,
        lastUpdated: action.meta.receivedAt,
      };
    },
    RESET_LINEAGE: defaultLineageState,
  },
  defaultLineageState()
);

export const getLineage = (state) => state.lineage;

export function fetchLineage(taxon, result = "taxon") {
  return async function (dispatch) {
    dispatch(requestLineage());
    let url = `${apiUrl}/record?recordId=${taxon}&result=${result}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      dispatch(receiveLineage(json));
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}

export const setSummaryField = createAction("SET_SUMMARY_FIELD");
export const summaryField = handleAction(
  "SET_SUMMARY_FIELD",
  (state, action) => action.payload,
  ""
);
export const getSummaryField = (state) => state.summaryField;

export const exploreReducers = {
  summaries,
  lineage,
  summaryField,
};
