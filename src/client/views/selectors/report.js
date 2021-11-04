import { apiUrl, setApiStatus } from "../reducers/api";
import {
  getReports,
  getReportsFetching,
  receiveReport,
  requestReport,
} from "../reducers/report";
import {
  getSearchIndex,
  getSearchResults,
  getSearchTerm,
} from "../reducers/search";

import { createCachedSelector } from "re-reselect";
import { createSelector } from "reselect";
import { getTypes } from "../reducers/types";
import { processTree } from "./tree";
import qs from "qs";
import store from "../store";

export function fetchReport({ queryString, reportId, reload }) {
  return async function (dispatch) {
    const state = store.getState();
    const fetching = getReportsFetching(state);
    const reports = getReports(state);
    if (!reload) {
      if (reports[reportId] || fetching[reportId]) {
        return;
      }
    }
    dispatch(requestReport(reportId));
    // TODO: use terms
    let url = `${apiUrl}/report?${queryString}`;
    try {
      let json;
      try {
        const response = await fetch(url);
        json = await response.json();
      } catch (error) {
        json = console.log("An error occured.", error);
      }
      json.report.report.queryString = queryString;
      dispatch(receiveReport({ json, reportId }));
    } catch (err) {
      return dispatch(setApiStatus(false));
    }
  };
}

const processScatter = (scatter) => {
  if (!scatter) {
    return {};
  }
  let chartData = [];
  let heatmaps = scatter.histograms;
  if (!heatmaps) {
    return {};
  }
  let valueType = heatmaps.valueType;
  let cats;
  let lastIndex = heatmaps.buckets.length - 2;
  let h = heatmaps.yBuckets[1] - heatmaps.yBuckets[0];
  let w = heatmaps.buckets[1] - heatmaps.buckets[0];
  let catSums;
  let pointData;
  let hasRawData = heatmaps.rawData ? true : false;
  if (hasRawData) {
    pointData = [];
  }
  if (heatmaps.byCat) {
    catSums = {};
    cats = scatter.cats.map((cat) => cat.label);
    scatter.cats.forEach((cat) => {
      catSums[cat.label] = 0;
      let catData = [];
      heatmaps.buckets.forEach((bucket, i) => {
        if (i < heatmaps.buckets.length - 1) {
          heatmaps.yBuckets.forEach((yBucket, j) => {
            if (j < heatmaps.yBuckets.length - 1) {
              let z = heatmaps.yValuesByCat[cat.key][i][j];
              if (z > 0) {
                catData.push({
                  h,
                  w,
                  x: bucket,
                  y: yBucket,
                  xBound: heatmaps.buckets[i + 1],
                  yBound: heatmaps.yBuckets[j + 1],
                  z,
                  count: heatmaps.allYValues[i][j],
                });
                catSums[cat.label] += z;
              }
            }
          });
        }
      });
      chartData.push(catData);
      if (hasRawData) {
        pointData.push(heatmaps.rawData[cat.key]);
      }
    });
  } else {
    cats = ["all taxa"];
    let catData = [];
    heatmaps.buckets.forEach((bucket, i) => {
      if (i < heatmaps.buckets.length - 1) {
        heatmaps.yBuckets.forEach((yBucket, j) => {
          if (j < heatmaps.yBuckets.length - 1) {
            let z = heatmaps.allYValues[i][j];
            if (z > 0) {
              catData.push({
                h,
                w,
                x: bucket,
                y: yBucket,
                xBound: heatmaps.buckets[i + 1],
                yBound: heatmaps.yBuckets[j + 1],
                z,
                count: z,
              });
            }
          }
        });
      }
    });
    chartData.push(catData);
    if (hasRawData) {
      pointData.push(heatmaps.rawData);
    }
  }
  console.log({ chartData, pointData });
  return { chartData, pointData, cats, catSums };
};

const processReport = (reports, reportId) => {
  let report = reports[reportId];
  if (!report) return {};
  if (report.name == "tree") {
    let { treeStyle } = qs.parse(report.report.queryString);
    return {
      ...report,
      report: {
        ...report.report,
        tree: {
          ...report.report.tree,
          ...processTree(report.report.tree.tree, treeStyle),
        },
      },
    };
  } else if (report.name == "scatter") {
    return {
      ...report,
      report: {
        ...report.report,
        scatter: {
          ...report.report.scatter,
          ...processScatter(report.report.scatter),
        },
      },
    };
  }
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

export const getReportFields = createSelector(
  getSearchIndex,
  getTypes,
  getSearchResults,
  (searchIndex, displayTypes, searchResults) => {
    let fields = [];
    for (let field of searchResults.fields) {
      if (displayTypes[searchIndex] && displayTypes[searchIndex][field]) {
        fields.push(displayTypes[searchIndex][field]);
      }
    }
    return fields;
  }
);

const reportOptions = {
  histogram: {
    x: {
      default: "query",
      fieldType: "value",
    },
    rank: {
      default: "query:tax_rank",
    },
  },
  scatter: {
    x: {
      default: "query",
      fieldType: "value",
    },
    y: {
      fieldType: "value",
    },
    rank: {
      default: "query:tax_rank",
    },
  },
  tree: {
    x: {
      default: "query",
      fieldType: "value",
    },
    // y: {
    //   fieldType: "any",
    // },
    treeStyle: {
      default: "treeStyle",
      value: "rect",
    },
  },
  xInY: {
    x: {
      default: "query",
      fieldType: "value",
    },
    rank: {
      default: "query:tax_rank",
    },
  },
};

export const getReportDefaults = createSelector(
  getReportFields,
  getSearchTerm,
  (reportFields, searchTerm) => {
    let fieldLists = {
      query: [],
      value: [],
      number: [],
      date: [],
      keyword: [],
      any: [],
    };
    for (let field of reportFields) {
      if (searchTerm.query.match(/\b/ + field.name + /\b/)) {
        fieldLists.query.push(field.name);
      } else if (field.type == "keyword") {
        fieldLists.keyword.push(field.name);
        fieldLists.any.push(field.name);
      } else if (field.type == "date") {
        fieldLists.date.push(field.name);
        fieldLists.value.push(field.name);
        fieldLists.any.push(field.name);
      } else {
        fieldLists.number.push(field.name);
        fieldLists.value.push(field.name);
        fieldLists.any.push(field.name);
      }
    }
    let reportDefaults = {};
    Object.keys(reportOptions).forEach((reportName) => {
      let params = reportOptions[reportName];
      reportDefaults[reportName] = {};
      Object.keys(params).forEach((param) => {
        let obj = params[param];
        // if (searchTerm.hasOwnProperty(param)) {
        //   reportDefaults[reportName][param] = searchTerm[param];
        // } else
        let [key, field] = obj.default ? obj.default.split(":") : [];
        if (field) {
          field = new RegExp(field + "\\((.+?)\\)");
        }
        if (searchTerm.hasOwnProperty(key) && !field) {
          reportDefaults[reportName][param] = searchTerm[obj.default];
        } else if (
          searchTerm.hasOwnProperty(key) &&
          field &&
          searchTerm[key].match(field)
        ) {
          let match = searchTerm[key].match(field);
          reportDefaults[reportName][param] = match[1];
          // } else if (obj.fieldType && fieldLists[obj.fieldType].length > 0) {
          //   reportDefaults[reportName][param] = fieldLists[obj.fieldType][0];
          //   Object.values(fieldLists).forEach((list) => {
          //     list = list.filter(
          //       (entry) => entry != reportDefaults[reportName][param]
          //     );
          //   });
        } else if (obj.hasOwnProperty("value")) {
          reportDefaults[reportName][param] = obj.value;
        }
      });
      if (
        reportDefaults[reportName].rank &&
        reportDefaults[reportName].x.match("tax_rank")
      ) {
        reportDefaults[reportName].x = reportDefaults[reportName].x
          .replace(/tax_rank\(\w+\)/, "")
          .replace(/and\s+and/gi, "AND")
          .replace(/\s*and\s*$/i, "");
      }
    });
    return reportDefaults;
  }
);
