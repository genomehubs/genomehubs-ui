import { combineReducers } from "redux";

import { apiReducers } from "./api";
import { colorReducers } from "./color";
import { exploreReducers } from "./explore";
import { locationReducers } from "./location";
import { lookupReducers } from "./lookup";
import { paneReducers } from "./panes";
import { recordReducers } from "./record";
import { searchReducers } from "./search";
import { trackingReducers } from "./tracking";

const allReducers = Object.assign(
  {},
  apiReducers,
  colorReducers,
  exploreReducers,
  locationReducers,
  lookupReducers,
  paneReducers,
  recordReducers,
  searchReducers,
  trackingReducers
);

const appReducer = combineReducers(allReducers);

const rootReducer = (state, action) => {
  if (action.type === "REFRESH") {
    let cookieConsent = state.cookieConsent;
    let analytics = state.analytics;
    let pathname = state.pathname;
    let hashString = state.hashString;
    let theme = state.theme;
    state = {
      analytics,
      cookieConsent,
      pathname,
      hashString,
      theme,
    };
  }
  return appReducer(state, action);
};

export default rootReducer;
