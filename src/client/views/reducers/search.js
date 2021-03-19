import { createAction, handleAction, handleActions } from "redux-actions";

import { apiUrl } from "./api";
import { createCachedSelector } from "re-reselect";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import qs from "qs";

export const requestSearch = createAction("REQUEST_SEARCH");
export const receiveSearch = createAction(
  "RECEIVE_SEARCH",
  (json) => json,
  () => ({ receivedAt: Date.now() })
);
export const cancelSearch = createAction("CANCEL_SEARCH");
export const resetSearch = createAction("RESET_SEARCH");

const defaultState = () => ({
  isFetching: false,
  status: {},
  results: [],
});

const searchResults = handleActions(
  {
    REQUEST_SEARCH: (state, action) =>
      immutableUpdate(state, {
        isFetching: true,
      }),
    CANCEL_SEARCH: (state, action) =>
      immutableUpdate(state, {
        isFetching: false,
      }),
    RECEIVE_SEARCH: (state, action) => ({
      isFetching: false,
      status: action.payload.status,
      results: action.payload.results,
      query: action.payload.query,
      lastUpdated: action.meta.receivedAt,
    }),
    RESET_SEARCH: defaultState,
  },
  defaultState()
);

export const getSearchResults = (state) => state.searchResults;

export const getSearchResultArray = createSelector(
  getSearchResults,
  (results) => {
    if (!results.status || !results.status.success || !results.results) {
      return [];
    }
    let arr = [];
    results.results.forEach((result) => {
      let obj = { id: result.id, ...result.result };
      if (obj.fields) {
        obj.fields = Object.keys(obj.fields).map((key) => ({
          id: key,
          ...obj.fields[key],
        }));
      }

      arr.push(obj);
    });
    return arr;
  }
);

export const getSearchResultById = createCachedSelector(
  getSearchResultArray,
  (_state, searchId) => searchId,
  (results, searchId) => {
    return results.find((result) => result.taxon_id === searchId);
  }
)((_state, searchId) => searchId);

export const saveSearchResults = (options, format = "tsv") => {
  const filename = `download.${format}`;
  options.filename = filename;
  const queryString = qs.stringify(options);
  const formats = {
    csv: "text/csv",
    json: "application/json",
    tsv: "text/tab-separated-values",
  };
  let url = `${apiUrl}/search?${queryString}`;
  fetch(url, {
    method: "GET",
    headers: {
      Accept: formats[format],
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    });
};

export const setSearchTerm = createAction("SET_SEARCH_TERM");
export const searchTerm = handleAction(
  "SET_SEARCH_TERM",
  (state, action) => action.payload,
  ""
);
export const getSearchTerm = (state) => state.searchTerm;

export const setSearchIndex = createAction("SET_SEARCH_INDEX");
export const searchIndex = handleAction(
  "SET_SEARCH_INDEX",
  (state, action) => action.payload,
  "multi"
);
export const getSearchIndex = (state) => state.searchIndex;

export const setPreferSearchTerm = createAction("SET_PREFER_SEARCH_TERM");
export const preferSearchTerm = handleAction(
  "SET_PREFER_SEARCH_TERM",
  (state, action) => action.payload,
  false
);
export const getPreferSearchTerm = (state) => state.preferSearchTerm;

export const setPreviousSearchTerm = createAction("SET_PREVIOUS_SEARCH_TERM");
export const previousSearchTerm = handleAction(
  "SET_PREVIOUS_SEARCH_TERM",
  (state, action) => action.payload,
  {}
);
export const getPreviousSearchTerm = (state) => state.previousSearchTerm;

const defaultSearchHistory = { byId: {}, allIds: [] };
export const setSearchHistory = createAction("SET_SEARCH_HISTORY");
export const searchHistory = handleAction(
  "SET_SEARCH_HISTORY",
  (state, action) => {
    return defaultSearchHistory;
  },
  defaultSearchHistory
);
export const getSearchHistory = (state) => state.searchTerm;

export const getSearchFields = createSelector(getSearchTerm, (searchTerm) => {
  let fields = [];
  if (searchTerm.fields && searchTerm.fields != "all") {
    fields = searchTerm.fields.split(/\s*,\s*/);
  }
  return fields;
});

export const getSearchRanks = createSelector(getSearchTerm, (searchTerm) => {
  let ranks = [];
  if (searchTerm.ranks) {
    ranks = searchTerm.ranks.split(/\s*,\s*/);
  }
  return ranks;
});

export const getSearchNameClasses = createSelector(
  getSearchTerm,
  (searchTerm) => {
    let names = [];
    if (searchTerm.names) {
      names = searchTerm.names.split(/\s*,\s*/);
    }
    return names;
  }
);

export const searchReducers = {
  searchTerm,
  searchIndex,
  searchResults,
  searchHistory,
  preferSearchTerm,
  previousSearchTerm,
};
