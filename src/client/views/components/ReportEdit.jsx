import React, { useState } from "react";

import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import SettingsButton from "./SettingsButton";
import TextField from "@material-ui/core/TextField";
import { compose } from "recompose";
import qs from "qs";
import withReportById from "../hocs/withReportById";

export const queryPropList = {
  histogram: ["report", "x", "rank", "cat"],
  xInY: ["report", "x", "y", "rank"],
  xPerRank: ["report", "x", "rank"],
};

const reportTypes = ["histogram", "xInY", "xPerRank"];

export const ReportEdit = ({
  reportId,
  reportById,
  report,
  fetchReport,
  modal,
  permaLink,
}) => {
  let fields = [];
  if (!reportById.report || !reportById.report.queryString) {
    return null;
  }
  let query = qs.parse(reportById.report.queryString);
  const defaultState = () => {
    let obj = {};
    queryPropList[report].forEach((queryProp) => {
      obj[queryProp] = query.hasOwnProperty(queryProp) ? query[queryProp] : "";
    });
    return obj;
  };
  let [values, setValues] = useState(defaultState);

  const handleChange = (e, queryProp) => {
    e.preventDefault();
    e.stopPropagation();
    setValues({ ...values, [queryProp]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newQueryString = qs.stringify({
      result: "taxon",
      ...Object.fromEntries(Object.entries(values).filter(([_, v]) => v != "")),
    });
    if (modal) {
      fetchReport({ reportId, queryString: newQueryString, reload: true });
    } else {
      permaLink(newQueryString);
    }
  };
  const handleReset = (e) => {
    e.preventDefault();
    setValues(defaultState);
  };

  queryPropList[report].forEach((queryProp) => {
    let input;
    if (queryProp == "report") {
      let items = reportTypes.map((rep) => {
        return (
          <MenuItem key={rep} value={rep}>
            {rep}
          </MenuItem>
        );
      });
      input = (
        <FormControl style={{ width: "100%" }}>
          <InputLabel id="select-report-label">report</InputLabel>
          <Select
            labelId="select-report-label"
            id="select-report"
            value={values["report"]}
            style={{ width: "100%" }}
            onChange={(e) => handleChange(e, "report")}
          >
            {items}
          </Select>
        </FormControl>
      );
    } else {
      input = (
        <TextField
          id={queryProp + Math.random()}
          label={queryProp}
          value={values[queryProp]}
          style={{ width: "100%" }}
          onChange={(e) => handleChange(e, queryProp)}
        />
      );
    }
    fields.push(
      <Grid item style={{ width: "100%" }}>
        {input}
      </Grid>
    );
  });
  fields.push(
    <Grid item align="right">
      <SettingsButton
        handleClick={handleSubmit}
        handleResetClick={handleReset}
      />
    </Grid>
  );
  return (
    <Grid
      container
      direction="column"
      style={{ height: "100%", width: "100%" }}
    >
      {fields}
    </Grid>
  );
};

export default compose(withReportById)(ReportEdit);
