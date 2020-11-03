import { createAction, handleAction, handleActions } from "redux-actions";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import { setApiStatus } from "./api";
import { createCachedSelector } from "re-reselect";
import store from "../store";
import qs from "qs";

const apiUrl = API_URL || "/api/v1";

const requestSearch = createAction("REQUEST_SEARCH");
const receiveSearch = createAction(
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

export function fetchSearchResults(options, navigate) {
  return async function (dispatch) {
    if (!options.hasOwnProperty("query")) {
      dispatch(cancelSearch);
    }
    const state = store.getState();
    const searchHistory = getSearchHistory(state);
    // console.log(searchHistory);

    dispatch(setSearchHistory(options));

    let searchTerm = options.query;
    if (!options.query.match(/[\(\)<>=]/)) {
      options.query = `tax_tree(${options.query})`;
    }
    if (!options.hasOwnProperty("summaryValues")) {
      options.summaryValues = "count";
    }
    if (!options.hasOwnProperty("result")) {
      options.result = "taxon";
    }
    dispatch(requestSearch());
    dispatch(setSearchTerm(options));
    const queryString = qs.stringify(options);
    let url = `${apiUrl}/search?${queryString}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      if (!json.results || json.results.length == 0) {
        if (!searchTerm.match(/[\(\)<>=]/)) {
          options.query = `tax_name(${searchTerm})`;
          dispatch(setPreferSearchTerm(true));
          dispatch(fetchSearchResults(options, navigate));
        } else if (searchTerm.match(/tax_tree/)) {
          options.query = searchTerm.replace("tax_tree", "tax_name");

          dispatch(setPreferSearchTerm(true));
          dispatch(fetchSearchResults(options, navigate));
        } else {
          dispatch(receiveSearch(json));
        }
      } else {
        if (navigate) {
          navigate(`search?${qs.stringify(options)}`, { replace: true });
        }
        dispatch(receiveSearch(json));
      }
    } catch (err) {
      dispatch(cancelSearch);
      return dispatch(setApiStatus(false));
    }
  };
}

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
    // console.log(action.payload);
    return defaultSearchHistory;
  },
  defaultSearchHistory
);
export const getSearchHistory = (state) => state.searchTerm;

export const searchReducers = {
  searchTerm,
  searchResults,
  searchHistory,
  preferSearchTerm,
  previousSearchTerm,
};
