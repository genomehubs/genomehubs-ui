import React, { useState } from "react";

import Box from "@material-ui/core/Box";
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
import withTaxonomy from "../hocs/withTaxonomy";

export const queryPropList = {
  histogram: [
    "report",
    "x",
    "rank",
    "cat",
    "includeEstimates",
    "yScale",
    "xOpts",
    "stacked",
    "cumulative",
  ],
  scatter: [
    "report",
    "x",
    "y",
    "rank",
    "cat",
    "includeEstimates",
    "zScale",
    "xOpts",
    "yOpts",
    "scatterThreshold",
  ],
  tree: ["report", "x", "y", "cat", "includeEstimates", "treeStyle"],
  xInY: ["report", "x", "y", "rank"],
  xPerRank: ["report", "x", "rank"],
};

const reportTypes = ["histogram", "scatter", "tree", "xInY", "xPerRank"];

export const ReportEdit = ({
  reportId,
  reportById,
  report,
  fetchReport,
  modal,
  permaLink,
  taxonomy,
}) => {
  let fields = [];
  if (!reportById.report || !reportById.report.queryString) {
    return null;
  }
  let query = qs.parse(reportById.report.queryString);
  if (query.report == "tree" && !query.treeStyle) {
    query.treeStyle = "ring";
  }
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
      [queryProp]:
        values[queryProp] && values[queryProp] != "false" ? false : true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newQueryString = qs.stringify({
      result: "taxon",
      taxonomy,
      ...Object.fromEntries(Object.entries(values).filter(([_, v]) => v != "")),
    });
    if (
      values.hasOwnProperty("includeEstimates") &&
      values.includeEstimates == ""
    ) {
      newQueryString += "&includeEstimates=false";
    }
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
        <FormControl style={{ width: "95%" }}>
          <InputLabel id="select-report-label">report</InputLabel>
          <Select
            labelId="select-report-label"
            id="select-report"
            value={values["report"]}
            style={{ width: "95%" }}
            onChange={(e) => handleChange(e, "report")}
          >
            {items}
          </Select>
        </FormControl>
      );
    } else if (queryProp == "treeStyle") {
      let items = ["ring", "rect"].map((shape) => {
        return (
          <MenuItem key={shape} value={shape}>
            {shape}
          </MenuItem>
        );
      });
      input = (
        <FormControl style={{ width: "95%" }}>
          <InputLabel id="select-tree-style-label">treeStyle</InputLabel>
          <Select
            labelId="select-tree-style-label"
            id="select-tree-style"
            value={values["treeStyle"]}
            style={{ width: "95%" }}
            onChange={(e) => handleChange(e, "treeStyle")}
          >
            {items}
          </Select>
        </FormControl>
      );
    } else if (
      queryProp == "includeEstimates" ||
      queryProp == "stacked" ||
      queryProp == "cumulative"
    ) {
      toggles.push(
        <div style={{ float: "left", marginRight: "2em" }}>
          <FormControl key={queryProp}>
            <Switch
              id={`report-${queryProp}`}
              checked={values[queryProp] && values[queryProp] != "false"}
              onClick={(e) => toggleSwitch(e, queryProp)}
              name={queryProp}
              color="default"
            />
            <FormHelperText>{queryProp}</FormHelperText>
          </FormControl>
        </div>
      );
    } else if (queryProp.endsWith("Scale")) {
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
            value="sqrt"
            control={<Radio color="default" />}
            label="sqrt"
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
          style={{ width: "95%" }}
          onChange={(e) => handleChange(e, queryProp)}
        />
      );
    }
    if (input) {
      fields.push(
        <Grid item style={{ width: "95%" }}>
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
    // <Grid
    //   container
    //   direction="column"
    //   style={{ height: "100%", width: "100%" }}
    // >
    <Box
      style={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "none",
      }}
    >
      {fields}
    </Box>
    // </Grid>
  );
};

export default compose(withTaxonomy, withReportById)(ReportEdit);
