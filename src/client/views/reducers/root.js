import { analysisReducers } from "./analysis";
import { apiReducers } from "./api";
import { colorReducers } from "./color";
import { combineReducers } from "redux";
import { exploreReducers } from "./explore";
import { fileReducers } from "./file";
import { lookupReducers } from "./lookup";
import { paneReducers } from "./panes";
import { recordReducers } from "./record";
import { reportReducers } from "./report";
import { searchReducers } from "./search";
import { trackingReducers } from "./tracking";
import { treeReducers } from "./tree";
import { typeReducers } from "./types";

const allReducers = Object.assign(
  {},
  analysisReducers,
  apiReducers,
  colorReducers,
  exploreReducers,
  fileReducers,
  lookupReducers,
  paneReducers,
  recordReducers,
  reportReducers,
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
