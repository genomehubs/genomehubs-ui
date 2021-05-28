import React, { useState } from "react";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Select from "@material-ui/core/Select";
import SettingsButton from "./SettingsButton";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import { compose } from "recompose";
import qs from "qs";
import withReportById from "../hocs/withReportById";

export const queryPropList = {
  histogram: [
    "report",
    "x",
    "rank",
    "cat",
    "includeEstimates",
    "yScale",
    "stacked",
  ],
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

  const toggleSwitch = (e, queryProp) => {
    e.preventDefault();
    e.stopPropagation();
    setValues({
      ...values,
      [queryProp]: !values[queryProp],
    });
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

  let toggles = [];

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
    } else if (queryProp == "includeEstimates" || queryProp == "stacked") {
      toggles.push(
        <div style={{ float: "left", marginRight: "2em" }}>
          <FormControl key={queryProp}>
            <Switch
              id={`report-${queryProp}`}
              checked={values[queryProp]}
              onClick={(e) => toggleSwitch(e, queryProp)}
              name={queryProp}
              color="default"
            />
            <FormHelperText>{queryProp}</FormHelperText>
          </FormControl>
        </div>
      );
    } else if (queryProp == "yScale") {
      input = (
        <RadioGroup
          aria-label={queryProp}
          name={queryProp}
          value={values[queryProp] || "linear"}
          onClick={(e) => handleChange(e, queryProp)}
          row
        >
          <FormControlLabel
            value="linear"
            control={<Radio color="default" />}
            label="linear"
          />
          <FormControlLabel
            value="log10"
            control={<Radio color="default" />}
            label="log10"
          />
          <FormControlLabel
            value="proportion"
            control={<Radio color="default" />}
            label="proportion"
          />
        </RadioGroup>
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
    if (input) {
      fields.push(
        <Grid item style={{ width: "100%" }}>
          {input}
        </Grid>
      );
    }
  });
  if (toggles.length > 0) {
    fields.push(
      <Grid item align="left">
        {toggles}
      </Grid>
    );
  }
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
