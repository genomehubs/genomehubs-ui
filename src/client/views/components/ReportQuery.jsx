import React, { useState } from "react";
import { useNavigate } from "@reach/router";
import Grid from "@material-ui/core/Grid";
import { compose } from "recompose";
import withReportById from "../hocs/withReportById";
import SearchIcon from "@material-ui/icons/Search";
import qs from "qs";
import withSearch from "../hocs/withSearch";
import { setSearchTerm } from "../reducers/search";

export const ReportQuery = ({ reportById, report, setPreferSearchTerm }) => {
  const navigate = useNavigate();
  let terms = [];
  if (!reportById.report || !reportById.report[report]) {
    return null;
  }

  const handleSearch = (searchTerm) => {
    let options = {
      ...searchTerm,
      offset: 0,
    };
    // delete options.fields;
    delete options.excludeAncestral;
    delete options.excludeDescendant;
    delete options.excludeDirect;
    delete options.excludeMissing;
    setPreferSearchTerm(true);
    setSearchTerm(searchTerm);
    navigate(`/search?${qs.stringify(options)}${location.hash}`);
  };

  let keys = ["xQuery", "yQuery"];
  let reports = reportById.report[report];
  if (!Array.isArray(reports)) reports = [reports];
  reports.forEach((rep) => {
    console.log(rep);
    keys.forEach((key) => {
      terms.push(
        <Grid item style={{ width: "100%" }}>
          <Grid container direction="row" style={{ width: "100%" }}>
            <Grid item xs={11}>
              {rep[key].query}
            </Grid>
            <Grid item xs={1}>
              <SearchIcon
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleSearch(rep[key]);
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      );
    });
  });
  return (
    <Grid
      container
      direction="column"
      style={{ height: "100%", width: "100%" }}
    >
      {terms}
    </Grid>
  );
};

export default compose(withSearch, withReportById)(ReportQuery);
