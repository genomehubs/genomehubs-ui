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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useNavigate } from "@reach/router";
import BasicTextField from "./BasicTextField";

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

const SearchOptions = ({
  searchTerm,
  searchResults,
  fetchSearchResults,
  setPreferSearchTerm,
  types,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
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
      offset: 0,
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
