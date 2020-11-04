import React, { memo, useState } from "react";
import { compose } from "recompose";
import styles from "./Styles.scss";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import qs from "qs";
import Button from "@material-ui/core/Button";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import ReplayIcon from "@material-ui/icons/Replay";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Checkbox from "@material-ui/core/Checkbox";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SettingsButton from "./SettingsButton";
import BasicSelect from "./BasicSelect";

import Switch from "@material-ui/core/Switch";
import { useLocation, useNavigate } from "@reach/router";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    minWidth: "600px",
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  root: {
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const SearchSettings = ({
  searchTerm,
  hashTerm,
  searchResults,
  fetchSearchResults,
  setPreferSearchTerm,
  searchIndex,
  setSearchIndex,
  types,
  groupedTypes,
}) => {
  const [state, setState] = React.useState(() => {
    let initialState = {};
    Object.keys(groupedTypes).forEach((key) => {
      let group = groupedTypes[key];
      initialState[key] = 0;
      Object.keys(group).forEach((id) => {
        let active = group[id].active == true;
        initialState[id] = active;
        if (active) {
          initialState[key] += active ? 1 : 0;
        }
      });
    });
    return initialState;
  });
  // let [index, setIndex] = useState(
  //   searchTerm.result ? searchTerm.result : "taxon"
  // );
  let index = searchIndex;
  let setIndex = setSearchIndex;

  const handleIndexChange = (e) => {
    e.stopPropagation();
    setIndex(e.target.value);
  };

  const handleGroupChange = (event, group, checked) => {
    event.stopPropagation();
    let newState = {};
    let sum = 0;
    Object.keys(groupedTypes[group]).forEach((id) => {
      newState[id] = !checked;
      sum++;
    });
    newState[group] = checked ? 0 : sum;
    setState({
      ...state,
      ...newState,
    });
  };

  const handleChange = (event, name, group) => {
    event.stopPropagation();
    let sum = state[group] + (state[name] ? -1 : 1);
    setState({
      ...state,
      [name]: !state[name],
      [group]: sum,
    });
  };
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  let options = { ...searchTerm };

  const handleClick = () => {
    let fields = [];
    Object.keys(state).forEach((key) => {
      if (state[key] === true) {
        fields.push(key);
      }
    });
    let options = {
      ...searchTerm,
      result: index,
      offset: 0,
      ...(fields.length > 0 && { fields: fields.join(",") }),
    };
    delete options.excludeAncestral;
    delete options.excludeDescendant;
    delete options.excludeDirect;
    setPreferSearchTerm(false);
    navigate(`search?${qs.stringify(options)}${location.hash}`);
  };

  const handleResetClick = () => {
    let options = {
      ...searchTerm,
      offset: 0,
    };
    delete options.fields;
    delete options.excludeAncestral;
    delete options.excludeDescendant;
    delete options.excludeDirect;
    setPreferSearchTerm(false);
    navigate(`search?${qs.stringify(options)}${location.hash}`);
  };

  let groups = [];
  let totals = {};
  Object.keys(groupedTypes).forEach((key) => {
    let group = groupedTypes[key];
    let content = [];
    totals[key] = 0;
    Object.keys(group).forEach((id) => {
      totals[key]++;
      content.push(
        <Grid container alignItems="center" direction="row">
          <Grid item>
            <FormControlLabel
              aria-label={`Item ${id}`}
              onClick={(e) => handleChange(e, id, key)}
              onFocus={(e) => e.stopPropagation()}
              control={
                <Checkbox color="default" name={id} checked={state[id]} />
              }
              label={`${id}`}
            />
          </Grid>
        </Grid>
      );
    });
    let checked = state[key] == totals[key];
    let indeterminate = state[key] > 0 && state[key] < totals[key];
    groups.push(
      <Grid item key={key}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-label="Expand"
            aria-controls={`Group ${key}-content`}
            id={`Group ${key}-header`}
          >
            <FormControlLabel
              aria-label={`Group ${key}`}
              onClick={(e) => handleGroupChange(e, key, checked)}
              onFocus={(e) => e.stopPropagation()}
              control={
                <Checkbox
                  color="default"
                  checked={checked}
                  indeterminate={indeterminate}
                />
              }
              label={`Group ${key}`}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justify="top" direction="column">
              {content}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    );
  });

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" direction="column">
        <Grid container alignItems="center" direction="row" spacing={2}>
          <Grid item>
            <BasicSelect
              current={index}
              id={"search-index-select"}
              handleChange={handleIndexChange}
              helperText={"search index"}
              values={{ Taxon: "taxon", Assembly: "assembly" }}
            />
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" direction="row" spacing={2}>
          {groups}
        </Grid>

        <Grid container justify="end" direction="row" spacing={2}>
          <SettingsButton
            handleClick={handleClick}
            handleResetClick={handleResetClick}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default compose(memo, withTypes, withSearch)(SearchSettings);
