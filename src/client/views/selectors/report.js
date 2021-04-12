import { apiUrl, setApiStatus } from "../reducers/api";
import {
  getReports,
  getReportsFetching,
  receiveReport,
  requestReport,
} from "../reducers/report";

import { createCachedSelector } from "re-reselect";
import { createSelector } from "reselect";
import store from "../store";

export function fetchReport({ terms, reportId, reportType, result }) {
  return async function (dispatch) {
    const state = store.getState();
    const fetching = getReportsFetching(state);
    const reports = getReports(state);
    if (reports[reportId] || fetching[reportId]) {
      return;
    }
    dispatch(requestReport(reportId));
    // TODO: use terms
    let url = `${apiUrl}/report?report=${reportType}&result=${result}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      dispatch(receiveReport({ json, reportId }));
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}

const processReport = (reports, reportId) => {
  let report = reports[reportId];
  if (!report) return {};
  // if (report.name == "histogram") {
  //   return processHistogram(report);
  // }
  // if (report.name == "terms") {
  //   return processTerms(report);
  // }
  return report;
};

export const getReportByReportId = createCachedSelector(
  getReports,
  (reports, reportId) => reportId,
  (reports, reportId) => processReport(reports, reportId)
)((reports, reportId) => reportId);
