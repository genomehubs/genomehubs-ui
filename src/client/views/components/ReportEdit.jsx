import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import SettingsButton from "./SettingsButton";
import { compose } from "recompose";
import withReportById from "../hocs/withReportById";
import qs from "qs";

export const queryPropList = [
  // "result",
  "report",
  "x",
  "y",
  // "z",
  // "cat",
  "rank",
  // "taxonomy",
];

const reportTypes = ["xPerRank", "xInY"];

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
    queryPropList.forEach((queryProp) => {
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

  queryPropList.forEach((queryProp) => {
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
