import { createAction, handleAction, handleActions } from "redux-actions";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import { setApiStatus } from "./api";
import { createCachedSelector } from "re-reselect";

const apiUrl = API_URL || "/api/v1";

const requestSearch = createAction("REQUEST_SEARCH");
const receiveSearch = createAction(
  "RECEIVE_SEARCH",
  (json) => json,
  () => ({ receivedAt: Date.now() })
);
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

export function fetchSearchResults(options) {
  return async function (dispatch) {
    if (!options.hasOwnProperty("query")) {
      return;
    }
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
    const queryString = Object.keys(options)
      .map((key) => `${key}=${escape(options[key])}`)
      .join("&");

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
          dispatch(fetchSearchResults(options));
        }
      } else {
        dispatch(receiveSearch(json));
      }
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}

export const setSearchTerm = createAction("SET_SEARCH_TERM");
export const searchTerm = handleAction(
  "SET_SEARCH_TERM",
  (state, action) => action.payload,
  ""
);
export const getSearchTerm = (state) => state.searchTerm;

export const searchReducers = {
  searchTerm,
  searchResults,
};
