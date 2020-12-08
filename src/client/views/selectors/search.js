import {
  apiUrl,
  cancelSearch,
  getSearchHistory,
  receiveSearch,
  requestSearch,
  setPreferSearchTerm,
  setSearchHistory,
  setSearchIndex,
  setSearchTerm,
} from "../reducers/search";

import qs from "qs";
import { setApiStatus } from "../reducers/api";
import store from "../store";

// import { fetchTypes } from "./types";

export function fetchSearchResults(options, navigate) {
  return async function (dispatch) {
    if (!options.hasOwnProperty("query")) {
      dispatch(cancelSearch);
    }
    const state = store.getState();
    const searchHistory = getSearchHistory(state);
    dispatch(setSearchHistory(options));

    let searchTerm = options.query;
    if (!options.hasOwnProperty("result")) {
      options.result = "assembly";
    }
    if (options.result == "taxon" && !options.query.match(/[\(\)<>=\n]/)) {
      options.query = `tax_tree(${options.query})`;
    }
    if (!options.hasOwnProperty("summaryValues")) {
      options.summaryValues = "count";
    }
    // dispatch(setSearchIndex(options.result));
    // dispatch(fetchTypes(options.result));
    dispatch(requestSearch());
    dispatch(setSearchTerm(options));
    const queryString = qs.stringify(options);
    const endpoint = "search";
    let url = `${apiUrl}/${endpoint}?${queryString}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      if (!json.results || json.results.length == 0) {
        if (!searchTerm.match(/[\(\)<>=\n]/)) {
          options.query = `tax_name(${searchTerm})`;
          dispatch(setPreferSearchTerm(true));
          dispatch(fetchSearchResults(options, navigate));
          // } else if (searchTerm.match(/tax_tree/)) {
          //   options.query = searchTerm.replace("tax_tree", "tax_name");

          //   dispatch(setPreferSearchTerm(true));
          //   dispatch(fetchSearchResults(options, navigate));
        } else if (
          searchTerm.match(/tax_rank/) ||
          searchTerm.match(/tax_depth/)
        ) {
          if (!options.hasOwnProperty("includeEstimates")) {
            options.includeEstimates = true;
            dispatch(setPreferSearchTerm(true));
            dispatch(fetchSearchResults(options, navigate));
          } else {
            dispatch(receiveSearch(json));
          }
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
