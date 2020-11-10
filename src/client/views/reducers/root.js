import { combineReducers } from "redux";

import { apiReducers } from "./api";
import { colorReducers } from "./color";
import { exploreReducers } from "./explore";
import { lookupReducers } from "./lookup";
import { paneReducers } from "./panes";
import { recordReducers } from "./record";
import { searchReducers } from "./search";
import { trackingReducers } from "./tracking";
import { treeReducers } from "./tree";
import { typeReducers } from "./types";

const allReducers = Object.assign(
  {},
  apiReducers,
  colorReducers,
  exploreReducers,
  lookupReducers,
  paneReducers,
  recordReducers,
  searchReducers,
  trackingReducers,
  treeReducers,
  typeReducers
);

const appReducer = combineReducers(allReducers);

const rootReducer = (state, action) => {
  if (action.type === "REFRESH") {
    let cookieConsent = state.cookieConsent;
    let analytics = state.analytics;
    let theme = state.theme;
    state = {
      analytics,
      cookieConsent,
      theme,
    };
  }
  return appReducer(state, action);
};

export default rootReducer;
