import React, { useRef, useState } from "react";

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
import { makeStyles } from "@material-ui/core/styles";
import qs from "qs";
import withReportById from "../hocs/withReportById";
import withTaxonomy from "../hocs/withTaxonomy";

const suggestedTerm = SUGGESTED_TERM || undefined;

const xSettings = {
  prop: "x",
  label: `tax_tree(${suggestedTerm}) AND assembly_span`,
  required: true,
};
const rankSettings = { prop: "rank", label: "family", required: true };
const catSettings = { prop: "cat", label: "assembly_level" };

export const queryPropList = {
  histogram: [
    "report",
    xSettings,
    rankSettings,
    catSettings,
    "includeEstimates",
    "yScale",
    "xOpts",
    "stacked",
    "cumulative",
  ],
  scatter: [
    "report",
    xSettings,
    { prop: "y", label: `c_value`, required: true },
    rankSettings,
    catSettings,
    "includeEstimates",
    "zScale",
    "xOpts",
    "yOpts",
    "scatterThreshold",
  ],
  tree: [
    "report",
    { ...xSettings, label: `tax_tree(${suggestedTerm})` },
    { prop: "y", label: `c_value` },
    "includeEstimates",
    "treeStyle",
  ],
  xInY: ["report", ["x"], "y", rankSettings, "includeEstimates"],
  xPerRank: ["report", "x", rankSettings, "includeEstimates"],
};

const reportTypes = ["histogram", "scatter", "tree", "xInY", "xPerRank"];

export const useStyles = makeStyles((theme) => ({
  label: {
    color: "rgba(0, 0, 0, 0.54)",
  },
}));

export const ReportEdit = ({
  reportId,
  reportById,
  report,
  fetchReport,
  modal,
  permaLink,
  handleUpdate,
  taxonomy,
}) => {
  const classes = useStyles();
  const formRef = useRef();
  let fields = [];
  if (!reportById.report || !reportById.report.queryString) {
    return null;
  }
  let query = qs.parse(reportById.report.queryString);
  if (query.report == "tree" && !query.treeStyle) {
    query.treeStyle = "rect";
  }
  const defaultState = () => {
    let obj = {};
    queryPropList[report].forEach((queryProp) => {
      let prop;
      if (Array.isArray(queryProp)) {
        prop = queryProp[0];
      } else if (typeof queryProp === "object" && queryProp !== null) {
        ({ prop } = queryProp);
      } else {
        prop = queryProp;
      }
      obj[prop] = query.hasOwnProperty(prop) ? query[prop] : "";
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
    if (!formRef.current.reportValidity()) {
      return;
    }
    let prevQuery = qs.parse(location.search.replace(/^\?+/, ""));
    let queryObj = Object.fromEntries(
      Object.entries(values).filter(([k, v]) => {
        if (v != "") {
          return true;
        } else {
          delete prevQuery[k];
          return false;
        }
      })
    );
    if (
      !values.hasOwnProperty("includeEstimates") ||
      values.includeEstimates == "" ||
      values.includeEstimates == "false" ||
      values.includeEstimates == false
    ) {
      queryObj.includeEstimates = false;
    } else {
      queryObj.includeEstimates = true;
    }
    if (!location.pathname.startsWith("/report")) {
      queryObj.query = queryObj.query || queryObj.x;
      if (queryObj.x) delete queryObj.x;
      if (queryObj.rank && !queryObj.query.match("tax_rank")) {
        queryObj.query += ` AND tax_rank(${queryObj.rank})`;
      }
    }

    console.log(queryObj);
    console.log(prevQuery);

    let hash = queryObj.query;
    let newQueryString = qs.stringify({
      ...prevQuery,
      ...queryObj,
      // result: "taxon",
      // taxonomy,
    });

    if (modal) {
      fetchReport({ reportId, queryString: newQueryString, reload: true });
    } else {
      handleUpdate({ queryString: newQueryString, hash });
    }
  };
  const handleReset = (e) => {
    e.preventDefault();
    setValues(defaultState);
  };

  let toggles = [];

  queryPropList[report].forEach((queryProp) => {
    let input;
    let required;
    let label;
    if (Array.isArray(queryProp)) {
      required = true;
      queryProp = queryProp[0];
    } else if (typeof queryProp === "object" && queryProp !== null) {
      ({ prop: queryProp, label, required } = queryProp);
    }

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
      let items = ["rect", "ring"].map((shape) => {
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
            <FormControlLabel
              className={classes.label}
              control={
                <Switch
                  id={`report-${queryProp}`}
                  checked={values[queryProp] && values[queryProp] != "false"}
                  onClick={(e) => toggleSwitch(e, queryProp)}
                  name={queryProp}
                  color="default"
                />
              }
              label={
                values[queryProp] && values[queryProp] != "false" ? "On" : "Off"
              }
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
      if (label && !values[queryProp]) {
        label = `${queryProp} - e.g. ${label}`;
      } else {
        label = queryProp;
      }
      input = (
        <TextField
          id={queryProp + Math.random()}
          label={label}
          value={values[queryProp]}
          required={required}
          error={required && !values[queryProp]}
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
      <form ref={formRef}>{fields}</form>
    </Box>
    // </Grid>
  );
};

export default compose(withTaxonomy, withReportById)(ReportEdit);
