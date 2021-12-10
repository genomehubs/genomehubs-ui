import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";
import SearchIcon from "@material-ui/icons/Search";
import { compose } from "recompose";
import qs from "qs";
import { setSearchTerm } from "../reducers/search";
import { useNavigate } from "@reach/router";
import withReportById from "../hocs/withReportById";
import withSearch from "../hocs/withSearch";
import withTaxonomy from "../hocs/withTaxonomy";

export const ReportQuery = ({
  reportById,
  report,
  setPreferSearchTerm,
  taxonomy,
}) => {
  const navigate = useNavigate();
  let terms = [];
  if (!reportById.report || !reportById.report[report]) {
    return null;
  }

  const handleSearch = (searchTerm) => {
    let options = {
      ...searchTerm,
      report,
      summaryValues: "count",
      offset: 0,
      taxonomy,
    };
    if (options.ranks && Array.isArray(options.ranks)) {
      options.ranks = options.ranks.join(",");
    }
    navigate(
      `/search?${qs.stringify(options)}#${encodeURIComponent(options.query)}`
    );
  };

  let params = ["x", "y"];
  let reports = reportById.report[report];
  if (!Array.isArray(reports)) reports = [reports];
  reports.forEach((rep) => {
    params.forEach((param) => {
      if (rep[param] > 0 && rep[`${param}Query`]) {
        terms.push(
          <Grid item style={{ width: "100%" }} key={param}>
            <Grid container direction="row" style={{ width: "100%" }}>
              <Grid item xs={11}>
                {rep[`${param}Query`].query}
              </Grid>
              <Grid item xs={1}>
                <SearchIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleSearch(rep[`${param}Query`]);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        );
      }
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

export default compose(withTaxonomy, withSearch, withReportById)(ReportQuery);
