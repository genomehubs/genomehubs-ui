import {
  getTaxonomies,
  getTaxonomiesFetching,
  receiveTaxonomies,
  requestTaxonomies,
  setCurrentTaxonomy,
} from "../reducers/taxonomy";

import { apiUrl } from "../reducers/api";
import { setApiStatus } from "../reducers/api";
import store from "../store";

export function fetchTaxonomies() {
  return async function (dispatch) {
    const state = store.getState();
    const taxonomies = getTaxonomies(state);
    if (taxonomies.length > 0) {
      return;
    }
    const fetching = getTaxonomiesFetching(state);
    if (fetching) {
      return;
    }
    dispatch(requestTaxonomies());
    // let url = `${apiUrl}/resultFields?result=${result}`;
    // try {
    //   let json;
    //   try {
    //     const response = await fetch(url);
    //     json = await response.json();
    //   } catch (error) {
    //     json = console.log("An error occured.", error);
    //   }
    //   json.index = result;
    let taxonomyList = ["ncbi", "ott"];
    dispatch(receiveTaxonomies(taxonomyList));
    dispatch(setCurrentTaxonomy(taxonomyList[0]));
    // } catch (err) {
    //   return dispatch(setApiStatus(false));
    // }
  };
}
