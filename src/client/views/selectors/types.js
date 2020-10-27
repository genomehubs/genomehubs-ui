import { createSelector } from "reselect";
import { setApiStatus } from "../reducers/api";
import store from "../store";
import {
  getTypes,
  getTypesFetching,
  requestTypes,
  receiveTypes,
} from "../reducers/types";

export const apiUrl = API_URL || "/api/v1";

export const getTypesMap = createSelector(getTypes, (types) => types);

export const getDisplayTypes = createSelector(getTypes, (types) => {
  let displayTypes = [];
  Object.values(types).forEach((type) => {
    if (type.display_level == 1) {
      displayTypes.push(type);
    }
  });
  return displayTypes;
});

export function fetchTypes(result) {
  return async function (dispatch) {
    const state = store.getState();
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
      dispatch(receiveTypes(json));
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}
