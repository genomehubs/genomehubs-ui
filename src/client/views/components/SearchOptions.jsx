import React, { useState } from "react";
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
import SearchIcon from "@material-ui/icons/Search";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import { useNavigate } from "@reach/router";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    minWidth: "600px",
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const TaxFilter = ({ current, id = "tax-filter-0", handleChange }) => {
  const classes = useStyles;
  let label = "Tax filter";
  let tree, name, eq;
  if (current.match(/^tax_\w+\(/)) {
    tree = current.replace(/^\w+/, "tax_tree");
    name = current.replace(/^\w+/, "tax_name");
    eq = current.replace(/^\w+/, "tax_eq");
  }
  return (
    <FormControl className={classes.formControl}>
      {/* <InputLabel id={`${id}-label`}>{label}</InputLabel> */}
      <Select
        // labelId={`${id}-label`}
        id={id}
        value={current}
        onChange={handleChange}
        label={label}
        inputProps={{ "aria-label": label }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={tree}>{tree}</MenuItem>
        <MenuItem value={name}>{name}</MenuItem>
        <MenuItem value={eq}>{eq}</MenuItem>
      </Select>
      <FormHelperText>{label}</FormHelperText>
    </FormControl>
  );
};

const BasicSelect = ({
  current,
  id,
  handleChange,
  label,
  helperText,
  values,
}) => {
  const classes = useStyles;
  let options = [];
  Object.keys(values).forEach((key) => {
    options.push(<MenuItem value={values[key]}>{key}</MenuItem>);
  });
  return (
    <FormControl className={classes.formControl}>
      {label && <InputLabel id={`${id}-label`}>{label}</InputLabel>}
      <Select
        labelId={label ? `${id}-label` : undefined}
        id={id}
        value={current}
        onChange={handleChange}
        label={label}
        inputProps={{ "aria-label": label ? label : helperText }}
      >
        {options}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const BasicTextField = ({ id, handleChange, label, helperText, value }) => {
  const classes = useStyles;
  return (
    <FormControl className={classes.formControl}>
      <TextField id={id} label={label} value={value} onChange={handleChange} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const SearchOptions = ({
  searchTerm,
  searchResults,
  fetchSearchResults,
  setPreferSearchTerm,
  types,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  let [index, setIndex] = useState(
    searchTerm.result ? searchTerm.result : "taxon"
  );
  let currentTaxon, currentFilter;
  if (searchTerm.query) {
    const parts = searchTerm.query.split(/\s*AND\s*/);
    parts.forEach((part, i) => {
      if (part.match(/^tax_\w+\(/)) {
        currentTaxon = part.replace(/^tax_\w+\(/, "").replace(/\)/, "");
        currentFilter = part.replace(/\(.+/, "");
      }
    });
  }
  let [taxFilter, setTaxFilter] = useState(
    currentTaxon
      ? { taxon: currentTaxon, filter: currentFilter }
      : { filter: "tax_tree" }
  );
  let controls = [];
  let options = { ...searchTerm };

  const handleIndexChange = (e) => {
    e.stopPropagation();
    setIndex(e.target.value);
  };
  const handleTaxonFilterChange = (e) => {
    e.stopPropagation();
    if (e.target.id == "taxon-filter-select") {
      setTaxFilter({ taxon: e.target.value, filter: taxFilter.filter });
    } else {
      setTaxFilter({
        taxon: taxFilter.taxon,
        filter: e.target.checked ? "tax_tree" : "tax_eq",
      });
    }
  };

  const handleClick = () => {
    let options = {
      ...searchTerm,
      query: `${taxFilter.filter}(${taxFilter.taxon})`,
      result: index,
    };
    setPreferSearchTerm(false);
    navigate(
      `search?${qs.stringify(options)}#${encodeURIComponent(taxFilter.taxon)}`
    );
  };

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" direction="column">
        <Grid container alignItems="center" direction="row">
          <Grid item>
            <BasicSelect
              current={index}
              id={"search-index-select"}
              handleChange={handleIndexChange}
              // label={"Search index"}
              helperText={"search index"}
              values={{ Taxon: "taxon", Assembly: "assembly" }}
            />
          </Grid>
        </Grid>
        <Grid container alignItems="center" direction="row">
          <Grid item>
            <BasicTextField
              id={"taxon-filter-select"}
              handleChange={handleTaxonFilterChange}
              helperText={"taxonomy filter"}
              value={taxFilter.taxon}
            />
          </Grid>
          {taxFilter.taxon && (
            <Grid item>
              <FormControlLabel
                className={classes.formControl}
                control={
                  <Switch
                    id={"taxon-filter-type-select"}
                    checked={taxFilter.filter == "tax_tree"}
                    onChange={handleTaxonFilterChange}
                    name="filter-type"
                    color="default"
                  />
                }
                label={
                  taxFilter.filter == "tax_tree"
                    ? "include descendants"
                    : "ignore descendants"
                }
              />
            </Grid>
          )}
        </Grid>
        <Grid container alignItems="right" direction="row">
          <Grid item>
            <Button
              variant="contained"
              color="default"
              disableElevation
              className={classes.button}
              startIcon={<SearchIcon />}
              onClick={handleClick}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default compose(withTypes, withSearch)(SearchOptions);
