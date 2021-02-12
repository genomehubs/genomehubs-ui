import { getSearchFields, getSearchIndex } from "../reducers/search";
import {
  getTypes,
  getTypesFetching,
  receiveTypes,
  requestTypes,
} from "../reducers/types";

import { apiUrl } from "../reducers/api";
import { createSelector } from "reselect";
import { setApiStatus } from "../reducers/api";
import store from "../store";

export const getTypesMap = createSelector(
  getTypes,
  getSearchIndex,
  (types, index) => {
    if (!types[index]) return {};
    return types[index];
  }
);

export const getActiveTypes = createSelector(
  getTypesMap,
  getSearchFields,
  (types, searchFields) => {
    let activeTypes = {};
    if (searchFields.length > 0) {
      searchFields.forEach((key) => {
        if (types[key]) {
          activeTypes[key] = true;
        }
      });
    } else {
      Object.keys(types).forEach((key) => {
        let type = types[key];
        if (type.display_level == 1) {
          activeTypes[key] = true;
        }
      });
    }
    return activeTypes;
  }
);

export const getDisplayTypes = createSelector(
  getTypesMap,
  getActiveTypes,
  (types, activeTypes) => {
    let displayTypes = [];
    Object.keys(types).forEach((key) => {
      if (activeTypes[key]) {
        displayTypes.push(types[key]);
      }
    });
    return displayTypes;
  }
);

export const getGroupedTypes = createSelector(
  getTypesMap,
  getActiveTypes,
  (types, activeTypes) => {
    let groupedTypes = {};
    Object.keys(types).forEach((key) => {
      let type = types[key];
      let group = type.display_group;
      if (!groupedTypes[group]) {
        groupedTypes[group] = {};
      }
      groupedTypes[group][key] = { ...type };
      if (activeTypes[key]) {
        groupedTypes[group][key].active = true;
      }
    });
    return groupedTypes;
  }
);

export function fetchTypes(result) {
  return async function (dispatch) {
    const state = store.getState();
    const types = getTypes(state);
    if (types[result]) {
      return;
    }
    const fetching = getTypesFetching(state);
    if (fetching) {
      return;
    }
    dispatch(requestTypes(result));
    let url = `${apiUrl}/resultFields?result=${result}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      json.index = result;
      dispatch(receiveTypes(json));
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}
