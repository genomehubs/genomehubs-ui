import {
  getHub,
  getRelease,
  getSource,
  getTypes,
  getTypesFetching,
  receiveTypes,
  requestTypes,
} from "../reducers/types";
import {
  getSearchFields,
  getSearchIndex,
  getSearchRanks,
} from "../reducers/search";

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

export const getVersion = createSelector(
  getHub,
  getRelease,
  getSource,
  (hub, release, source) => {
    if (!hub) return {};
    return { hub, release, source };
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

export const taxonomyRanks = {
  subspecies: {
    name: "subspecies",
    display_name: "Subspecies",
    display_group: "ranks",
  },
  species: {
    name: "species",
    display_name: "Species",
    display_group: "ranks",
  },
  genus: { name: "genus", display_name: "Genus", display_group: "ranks" },
  family: {
    name: "family",
    display_name: "Family",
    display_group: "ranks",
    display_level: 1,
  },
  order: {
    name: "order",
    display_name: "Order",
    display_group: "ranks",
    display_level: 1,
  },
  class: { name: "class", display_name: "Class", display_group: "ranks" },
  phylum: {
    name: "phylum",
    display_name: "Phylum",
    display_group: "ranks",
    display_level: 1,
  },
  kingdom: {
    name: "kingdom",
    display_name: "Kingdom",
    display_group: "ranks",
  },
  superkingdom: {
    name: "superkingdom",
    display_name: "Superkingdom",
    display_group: "ranks",
  },
};

export const getActiveRanks = createSelector(getSearchRanks, (searchRanks) => {
  let activeRanks = {};
  if (searchRanks.length > 0) {
    searchRanks.forEach((key) => {
      activeRanks[key] = true;
    });
    // } else {
    //   Object.keys(taxonomyRanks).forEach((key) => {
    //     let rank = taxonomyRanks[key];
    //     if (rank.display_level == 1) {
    //       activeRanks[key] = true;
    //     }
    //   });
  }
  return activeRanks;
});

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
  getActiveRanks,
  (types, activeTypes, activeRanks) => {
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
    groupedTypes.ranks = {};
    Object.keys(taxonomyRanks).forEach((rank) => {
      groupedTypes.ranks[rank] = { ...taxonomyRanks[rank] };
      if (activeRanks[rank]) {
        groupedTypes.ranks[rank].active = true;
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
