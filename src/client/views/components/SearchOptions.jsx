import React, { useState } from "react";
import { compose } from "recompose";
import styles from "./Styles.scss";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import qs from "qs";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useNavigate } from "@reach/router";
import BasicTextField from "./BasicTextField";
import BasicSelect from "./BasicSelect";
import IconButton from "@material-ui/core/IconButton";

export const useStyles = makeStyles((theme) => ({
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

const VariableFilter = ({
  field,
  operator = "",
  value = "",
  bool,
  label,
  fields,
  handleVariableChange,
  handleOperatorChange,
  handleValueChange,
  handleDismiss,
}) => {
  const classes = useStyles();
  const allowedOperators = {
    "": "",
    ">": ">",
    ">=": ">=",
    "<": "<",
    "<=": "<=",
    "=": "=",
  };
  return (
    <Grid container alignItems="center" direction="row" spacing={2}>
      {bool && (
        <Grid item>
          <Typography>{bool}</Typography>
        </Grid>
      )}
      <Grid item>
        <BasicSelect
          current={field}
          id={`variable-${field}-select`}
          handleChange={handleVariableChange}
          helperText={"field"}
          values={fields}
        />
      </Grid>
      <Grid item>
        <BasicSelect
          current={operator}
          id={`variable-${field}-operator-select`}
          handleChange={handleOperatorChange}
          helperText={"operator"}
          values={allowedOperators}
        />
      </Grid>
      <Grid item>
        <BasicTextField
          id={`variable-${field}-value-input`}
          handleChange={handleValueChange}
          helperText={"value"}
          value={value}
        />
      </Grid>
      <Grid item style={{ marginLeft: "auto" }}>
        <IconButton
          aria-label="remove filter"
          size="inherit"
          onClick={handleDismiss}
        >
          <CloseIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

// const handleValueChange =

const SearchOptions = ({
  searchTerm,
  searchResults,
  fetchSearchResults,
  setLookupTerm,
  setPreferSearchTerm,
  types,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  let currentTaxon, currentFilter;

  let currentRank, currentDepth;
  let filters = {};
  let bool = false;
  if (searchTerm.query) {
    searchTerm.query.split(/\s*AND\s*/).forEach((term) => {
      let taxQuery = term.match(/tax_(\w+)\((.+?)\)/);
      if (taxQuery) {
        if (taxQuery[1] == "rank") {
          currentRank = taxQuery[2];
          bool = "AND";
        } else if (taxQuery[1] == "depth") {
          currentDepth = taxQuery[2];
        } else {
          currentTaxon = taxQuery[2];
          currentFilter = `tax_${taxQuery[1]}`;
        }
      } else {
        let parts = term.split(/\s*([\>\<=]+)\s*/);
        if (types[parts[0]]) {
          if (!filters[parts[0]]) {
            filters[parts[0]] = {};
          }
          filters[parts[0]][parts[1]] = parts[2];
        }
      }
    });
  }
  let [varFilters, setVarFilters] = useState(filters);

  const buildQuery = () => {
    let newFilters = "";
    let newFilterArray = [];
    Object.keys(varFilters).forEach((key, i) => {
      Object.keys(varFilters[key]).forEach((operator) => {
        newFilterArray.push(`${key}${operator}${varFilters[key][operator]}`);
      });
    });
    if (newFilterArray.length > 0) {
      newFilters = taxFilter.taxon ? " AND " : "";
      newFilters += newFilterArray.join(" AND ");
    }
    let query = taxFilter.taxon
      ? `${taxFilter.filter}(${taxFilter.taxon})`
      : "";
    query += newFilters;
    return query;
  };

  const handleVariableChange = (e, key, operator) => {
    e.stopPropagation();
    let value;
    let prevState;
    if (key && operator) {
      value = varFilters[key][operator];
      prevState = {
        ...varFilters,
        [key]: {
          ...varFilters[key],
        },
        [e.target.value]: {
          ...varFilters[e.target.value],
        },
      };
      delete prevState[key][operator];
    } else {
      operator = "";
      prevState = {
        ...varFilters,
      };
    }
    setVarFilters({
      ...prevState,
      ...(key && {
        [key]: {
          ...prevState[key],
        },
      }),
      [e.target.value]: {
        ...prevState[e.target.value],
        [operator]: value,
      },
    });
  };

  let filterOptions = [];
  let variableValues = {};
  let keywordValues = {};
  let allValues = {};
  const variableTypes = [
    "long",
    "integer",
    "short",
    "byte",
    "double",
    "float",
    "half_float",
    "scaled_float",
  ];
  Object.keys(types).forEach((key) => {
    let type = types[key];
    allValues[key] = key;
    if (variableTypes.includes(type.type)) {
      variableValues[key] = key;
    } else if (types.type == "keyword") {
      keywordValues[key] = key;
    }
  });
  Object.keys(varFilters).forEach((key, i) => {
    if (variableValues[key]) {
      Object.keys(varFilters[key]).forEach((operator) => {
        filterOptions.push(
          <VariableFilter
            key={key}
            field={key}
            fields={variableValues}
            operator={operator}
            value={varFilters[key][operator]}
            bool={bool}
            handleVariableChange={(e) => handleVariableChange(e, key, operator)}
            handleOperatorChange={(e) => {
              e.stopPropagation();
              let value = varFilters[key][operator];
              let prevState = {
                ...varFilters,
                [key]: {
                  ...varFilters[key],
                },
              };
              delete prevState[key][operator];
              setVarFilters({
                ...prevState,
                [key]: {
                  ...prevState[key],
                  [e.target.value]: value,
                },
              });
            }}
            handleValueChange={(e) => {
              e.stopPropagation();
              setVarFilters({
                ...varFilters,
                [key]: {
                  ...varFilters[key],
                  [operator]: e.target.value,
                },
              });
            }}
            handleDismiss={(e) => {
              e.stopPropagation();
              let prevState = {
                ...varFilters,
                [key]: {
                  ...varFilters[key],
                },
              };
              delete prevState[key][operator];
              setVarFilters({
                ...prevState,
                [key]: { ...prevState[key] },
              });
            }}
          />
        );
      });
    }
  });
  filterOptions.push(
    <Grid container alignItems="center" direction="row" spacing={2}>
      {bool && (
        <Grid item>
          <Typography>{bool}</Typography>
        </Grid>
      )}
      <Grid item>
        <BasicSelect
          current={""}
          id={`new-variable-select`}
          handleChange={handleVariableChange}
          helperText={"field"}
          values={allValues}
        />
      </Grid>
    </Grid>
  );
  // if (searchTerm.query) {
  //   const parts = searchTerm.query.split(/\s*AND\s*/);
  //   parts.forEach((part, i) => {
  //     if (part.match(/^tax_\w+\(/)) {
  //       currentTaxon = part.replace(/^tax_\w+\(/, "").replace(/\)/, "");
  //       currentFilter = part.replace(/\(.+/, "");
  //     }
  //   });
  // }
  let [taxFilter, setTaxFilter] = useState(
    currentTaxon
      ? { taxon: currentTaxon, filter: currentFilter }
      : { filter: "tax_tree" }
  );

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
    let query = buildQuery();
    let options = {
      ...searchTerm,
      offset: 0,
      query,
    };
    setPreferSearchTerm(false);
    navigate(
      `search?${qs.stringify(options)}#${encodeURIComponent(options.query)}`
    );
  };

  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" direction="column">
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
        {filterOptions}
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

export default compose(withTypes, withSearch, withLookup)(SearchOptions);
