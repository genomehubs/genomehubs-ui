import { createAction, handleAction, handleActions } from "redux-actions";
import { createSelector } from "reselect";
import immutableUpdate from "immutable-update";
import { setApiStatus } from "./api";

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

export function fetchSearchResults(searchTerm, result = "taxon") {
  return async function (dispatch) {
    dispatch(requestSearch());
    dispatch(setSearchTerm(searchTerm));
    let query;
    if (searchTerm.match(/[\(\)<>=]/)) {
      query = escape(searchTerm);
    } else {
      query = escape(`tax_tree(${searchTerm})`);
    }
    let url = `${apiUrl}/search?query=${query}&result=${result}&summaryValues=count&sortBy=assembly_span&sortOrder=desc`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      dispatch(receiveSearch(json));
    } catch (err) {
      console.log(err);
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
