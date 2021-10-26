import React, { useEffect, useState } from "react";

import AddIcon from "@material-ui/icons/Add";
import BasicComplete from "./BasicComplete";
import BasicSelect from "./BasicSelect";
import BasicTextField from "./BasicTextField";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import Switch from "@material-ui/core/Switch";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import VariableFilter from "./VariableFilter";
import { compose } from "recompose";
import { makeStyles } from "@material-ui/core/styles";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import withSearchDefaults from "../hocs/withSearchDefaults";
import withTaxonomy from "../hocs/withTaxonomy";
import withTypes from "../hocs/withTypes";

export const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    minWidth: "600px",
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    boxShadow: "none",
  },
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

// const handleValueChange =

const QueryBuilder = ({
  searchTerm,
  searchResults,
  fetchSearchResults,
  setLookupTerm,
  searchIndex,
  setSearchIndex,
  setSearchDefaults,
  setPreferSearchTerm,
  taxonomy,
  types,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  let ranks = {
    "": "",
    superkingdom: "superkingdom",
    kingdom: "kingdom",
    phylum: "phylum",
    class: "class",
    order: "order",
    family: "family",
    genus: "genus",
    species: "species",
    subspecies: "subspecies",
  };
  let taxFilters = {
    taxon: null,
    filter: false,
    rank: "",
    level: null,
  };
  const [index, setIndex] = useState(searchIndex);
  let [varFilters, setVarFilters] = useState({});
  let [varSummaries, setVarSummaries] = useState({});
  let [taxFilter, setTaxFilter] = useState(taxFilters);
  let bool = false;

  useEffect(() => {
    let filters = {};
    let summaries = {};
    if (searchTerm.query) {
      searchTerm.query.split(/\s*AND\s*/).forEach((term) => {
        let taxQuery = term.match(/tax_(\w+)\((.+?)\)/);
        if (taxQuery) {
          if (taxQuery[1] == "rank") {
            taxFilters.rank = taxQuery[2];
            bool = "AND";
          } else if (taxQuery[1] == "depth") {
            taxFilters.depth = taxQuery[2];
          } else {
            taxFilters.taxon = taxQuery[2];
            taxFilters.filter = `tax_${taxQuery[1]}`;
          }
        } else {
          let parts = term.split(/\s*([\>\<=]+)\s*/);
          if (types[parts[0]]) {
            if (!filters[parts[0]]) {
              filters[parts[0]] = {};
            }
            if (!summaries[parts[0]]) {
              summaries[parts[0]] = {};
            }
            filters[parts[0]][parts[1]] = parts[2];
            summaries[parts[0]][parts[1]] = "value";
          } else {
            let [summary, attr] = term.split(/[\(\))]/);
            if (types[attr]) {
              if (!filters[attr]) {
                filters[attr] = {};
              }
              if (!summaries[attr]) {
                summaries[attr] = {};
              }
              filters[attr][parts[1]] = parts[2];
              summaries[attr][parts[1]] = summary;
            }
          }
        }
      });
    }
    setVarFilters(filters);
    setVarSummaries(summaries);
    setTaxFilter(taxFilters);
  }, []);

  // let index = searchIndex;
  // let setIndex = setSearchIndex;

  const handleIndexChange = (e) => {
    e.stopPropagation();
    setIndex(e.target.value);
  };

  const buildQuery = () => {
    let query = "";
    if (taxFilter.taxon) {
      query = `${taxFilter.filter}(${taxFilter.taxon})`;
      if (taxFilter.rank || taxFilter.depth) {
        query += " AND ";
      }
    }
    if (taxFilter.rank) {
      query += `tax_rank(${taxFilter.rank})`;
      if (taxFilter.depth) {
        query += " AND ";
      }
    }
    if (taxFilter.depth) {
      query += `tax_depth(${taxFilter.depth})`;
    }
    let newFilters = "";
    let newFilterArray = [];
    Object.keys(varFilters).forEach((key, i) => {
      Object.keys(varFilters[key]).forEach((operator) => {
        if (varSummaries[key][operator] != "value") {
          newFilterArray.push(
            `${varSummaries[key][operator]}(${key})${operator}${varFilters[key][operator]}`
          );
        } else {
          newFilterArray.push(`${key}${operator}${varFilters[key][operator]}`);
        }
      });
    });
    if (newFilterArray.length > 0) {
      newFilters = taxFilter.taxon || taxFilter.rank ? " AND " : "";
      newFilters += newFilterArray.join(" AND ");
    }
    query += newFilters;
    return query;
  };

  const handleVariableChange = (e, key, operator) => {
    e.stopPropagation();
    let value;
    let summary;
    let prevState;
    let summState;
    if (key && operator) {
      value = varFilters[key][operator];
      summary = varSummaries[key][operator];
      prevState = {
        ...varFilters,
        [key]: {
          ...varFilters[key],
        },
      };
      summState = {
        ...varSummaries,
        [key]: {
          ...varSummaries[key],
        },
      };
      delete prevState[key][operator];
      delete summState[key][operator];
    } else {
      operator = "";
      prevState = {
        ...varFilters,
      };
      summState = {
        ...varSummaries,
      };
    }
    setVarFilters({
      ...prevState,
      // ...(key && {
      //   [key]: {
      //     ...prevState[key],
      //   },
      // }),
      [e.target.value]: {
        ...prevState[e.target.value],
        [operator]: value,
      },
    });
    setVarSummaries({
      ...summState,
      [e.target.value]: {
        ...summState[e.target.value],
        [operator]: summary ? summary : "value",
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
    "keyword",
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
            summary={varSummaries[key][operator]}
            bool={bool}
            handleVariableChange={(e) => handleVariableChange(e, key, operator)}
            handleSummaryChange={(e) => {
              e.stopPropagation();
              let prevState = {
                ...varSummaries,
                [key]: {
                  ...varSummaries[key],
                },
              };
              setVarSummaries({
                ...prevState,
                [key]: {
                  ...prevState[key],
                  [operator]: e.target.value,
                },
              });
            }}
            handleOperatorChange={(e) => {
              e.stopPropagation();
              let value = varFilters[key][operator];
              let summary = varSummaries[key][operator];
              let prevState = {
                ...varFilters,
                [key]: {
                  ...varFilters[key],
                },
              };
              let summState = {
                ...varSummaries,
                [key]: {
                  ...varSummaries[key],
                },
              };
              delete prevState[key][operator];
              delete summState[key][operator];
              setVarFilters({
                ...prevState,
                [key]: {
                  ...prevState[key],
                  [e.target.value]: value,
                },
              });
              setVarSummaries({
                ...summState,
                [key]: {
                  ...summState[key],
                  [e.target.value]: summary,
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

  let [moreOptions, setMoreOptions] = useState(() => {
    let opts = { ...searchTerm };
    if (!opts.includeEstimates || opts.includeEstimates == "false") {
      opts.includeEstimates = false;
    } else {
      opts.includeEstimates = true;
    }
    opts.offset = 0;
    delete opts.query;
    delete opts.excludeAncestral;
    delete opts.excludeDescendant;
    delete opts.excludeDirect;
    delete opts.excludeMissing;
    return opts;
  });

  const handleTaxonFilterChange = (e) => {
    e.stopPropagation();
    let id = e.target.id ? e.target.id.replace("taxon-filter-", "") : "rank";
    let value = e.target.value;
    if (id == "estimates") {
      setMoreOptions({
        ...moreOptions,
        includeEstimates: e.target.checked,
      });
    }
    if (id == "filter") {
      value = e.target.checked ? "tax_tree" : "tax_eq";
    } else if (id == "rank") {
      if (value != "") {
        setMoreOptions({
          ...moreOptions,
          includeEstimates: true,
        });
      }
    }
    setTaxFilter({
      ...taxFilter,
      [id]: value,
    });
  };

  const handleClick = () => {
    let query = buildQuery();
    let options = {
      ...moreOptions,
      query,
      result: index,
      taxonomy,
    };
    let includeDescendants = options.includeDescendants;
    let includeEstimates = options.includeEstimates;
    setSearchDefaults({
      includeDescendants,
      includeEstimates,
    });
    setPreferSearchTerm(false);
    navigate(
      `/search?${qs.stringify(options)}#${encodeURIComponent(options.query)}`
    );
  };
  return (
    <Paper className={classes.paper}>
      <Grid container alignItems="center" direction="column" spacing={2}>
        <Grid container direction="row">
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
        <Grid container alignItems="center" direction="row" spacing={2}>
          <Tooltip title="Taxon ID or scientific name" arrow placement={"top"}>
            <Grid item>
              <BasicTextField
                id={"taxon-filter-taxon"}
                handleChange={handleTaxonFilterChange}
                helperText={"taxon"}
                value={taxFilter.taxon}
              />
            </Grid>
          </Tooltip>
          {taxFilter.taxon && (
            <Tooltip
              title={`Toggle switch to ${
                taxFilter.filter == "tax_tree"
                  ? "exclude descendant taxa from"
                  : "include descendant taxa in"
              } results`}
              arrow
              placement={"top"}
            >
              <Grid item>
                <FormControl className={classes.formControl}>
                  <Switch
                    id={"taxon-filter-filter"}
                    checked={taxFilter.filter == "tax_tree"}
                    onChange={handleTaxonFilterChange}
                    name="filter-type"
                    color="default"
                  />
                  <FormHelperText>
                    {taxFilter.filter == "tax_tree"
                      ? "include descendants"
                      : "ignore descendants"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Tooltip>
          )}
          <Tooltip
            title="Restrict results to a given taxonomic rank"
            arrow
            placement={"top"}
          >
            <Grid item>
              <BasicSelect
                id={"taxon-filter-rank"}
                handleChange={handleTaxonFilterChange}
                helperText={"rank"}
                current={taxFilter.rank}
                values={ranks}
              />
            </Grid>
          </Tooltip>
          <Tooltip
            title={`Toggle switch to ${
              moreOptions.includeEstimates
                ? "exclude taxa with only estimated values from"
                : "include all taxa in"
            } results`}
            arrow
            placement={"top"}
          >
            <Grid item>
              <FormControl className={classes.formControl}>
                <Switch
                  id={"taxon-filter-estimates"}
                  checked={moreOptions.includeEstimates}
                  onChange={handleTaxonFilterChange}
                  name="filter-estimates"
                  color="default"
                />
                <FormHelperText>
                  {moreOptions.includeEstimates
                    ? "include estimates"
                    : "ignore estimates"}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Tooltip>
          <Tooltip
            title="Limit search to a given taxonomic depth"
            arrow
            placement={"top"}
          >
            <Grid item>
              <BasicTextField
                id={"taxon-filter-depth"}
                handleChange={handleTaxonFilterChange}
                helperText={"depth"}
                value={taxFilter.depth}
              />
            </Grid>
          </Tooltip>
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

export default compose(
  withTypes,
  withTaxonomy,
  withSearch,
  withSearchDefaults,
  withLookup
)(QueryBuilder);