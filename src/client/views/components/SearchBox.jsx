import React, { memo, useRef, useState } from "react";
import { findDOMNode } from "react-dom";
import { compose } from "recompose";
import classnames from "classnames";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import qs from "qs";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import SearchIcon from "@material-ui/icons/Search";
import Grid from "@material-ui/core/Grid";
import Popper from "@material-ui/core/Popper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  search: {
    fontSize: "2em",
    marginLeft: theme.spacing(1),
    backgroundColor: "inherit",
  },
}));

const PlacedPopper = (props) => {
  return <Popper {...props} placement="top" />;
};

const AutoCompleteSuggestion = ({ option }) => {
  const classes = useStyles();
  return (
    <Grid container alignItems="center">
      <Grid item>
        <HelpOutlineIcon className={classes.icon} />
      </Grid>
      <Grid item xs>
        <Typography variant="body2" color="textSecondary">
          Did you mean
        </Typography>
        <div>{option.title}</div>
      </Grid>
    </Grid>
  );
};

const AutoCompleteOption = ({ option }) => {
  const classes = useStyles();
  return (
    <Grid container alignItems="center">
      <Grid item>
        <SearchIcon className={classes.icon} />
      </Grid>
      <Grid item xs>
        <div>{option.title}</div>
        <span style={{ float: "right" }}>
          <Typography variant="body2" color="textSecondary">
            {option.taxon_id}
          </Typography>
        </span>
        <Typography variant="body2" color="textSecondary">
          {option.taxon_rank}
          {option.name_class != "scientific name" && (
            <span> :: {option.scientific_name}</span>
          )}
        </Typography>
      </Grid>
    </Grid>
  );
};

const siteName = SITENAME || "GenomeHub";

const SearchBox = ({
  lookupTerm,
  setLookupTerm,
  resetLookup,
  lookupTerms,
  fetchLookup,
  fetchSearchResults,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  let [open, setOpen] = useState(false);
  let result = "taxon";
  const dispatchSearch = (options, term) => {
    fetchSearchResults(options);
    navigate(`search?${qs.stringify(options)}#${term}`);
  };

  const doSearch = (query, term) => {
    dispatchSearch({ query, result }, term);
    resetLookup();
  };
  const updateTerm = (value) => {
    setLookupTerm(value);
    fetchLookup(value);
  };
  const handleChange = (e, newValue) => {
    if (newValue != lookupTerm) {
      updateTerm(newValue);
      setOpen(true);
    }
  };
  const handleKeyDown = (e, newValue) => {
    if (newValue.highlighted) {
      setOpen(true);
    } else {
      setOpen(false);
      doSearch(newValue.taxon_id, newValue.title);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(lookupTerm, lookupTerm);
  };

  let terms;
  let options = [];
  if (
    lookupTerms.status &&
    lookupTerms.status.success &&
    lookupTerms.results &&
    lookupTerms.results.length > 0 &&
    !/[\(\)<>=]/.test(lookupTerm)
  ) {
    terms = [];
    lookupTerms.results.forEach((result, i) => {
      let value;
      if (result.reason) {
        value = result.reason[0].fields["taxon_names.name.raw"][0];
      } else {
        value = result.result.scientific_name;
      }
      options.push({
        title: value,
        taxon_id: result.result.taxon_id,
        taxon_rank: result.result.taxon_rank,
        scientific_name: result.result.scientific_name,
        name_class: result.reason[0].fields["taxon_names.class"],
      });

      terms.push(
        <div
          key={i}
          className={styles.term}
          onClick={() => updateSearch(value)}
        >
          <span className={styles.value}>{value}</span>
          <div
            className={styles.extra}
          >{`\u2014 ${result.result.taxon_rank}`}</div>
        </div>
      );
    });
  }
  if (
    lookupTerms.status &&
    lookupTerms.status.success &&
    lookupTerms.suggestions &&
    lookupTerms.suggestions.length > 0 &&
    !/[\(\)<>=]/.test(lookupTerm)
  ) {
    lookupTerms.suggestions.forEach((suggestion, i) => {
      options.push({
        title: suggestion.suggestion.text,
        highlighted: suggestion.suggestion.highlighted,
      });
    });
  }
  return (
    <div
      className={classnames(styles.flexColumn, styles.flexCenter)}
      style={{
        height: "6em",
        minWidth: "600px",
        overflow: "visible",
        zIndex: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          minWidth: "600px",
          flex: "0 1 auto",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Grid container alignItems="center">
          <Grid item style={{ width: "600px" }}>
            <Autocomplete
              id="main-search"
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.title
              }
              getOptionSelected={(option, value) =>
                option.title === value.title
              }
              options={options}
              autoComplete
              includeInputInList
              freeSolo
              value={lookupTerm}
              open={open}
              onChange={handleKeyDown}
              onInputChange={handleChange}
              PopperComponent={PlacedPopper}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Search ${siteName}`}
                  variant="outlined"
                  fullWidth
                />
              )}
              renderOption={(option) => {
                if (option.highlighted) {
                  return <AutoCompleteSuggestion option={option} />;
                }
                return <AutoCompleteOption option={option} />;
              }}
            />
          </Grid>
          <Grid item>
            <IconButton className={classes.search} type="submit">
              <SearchIcon />
            </IconButton>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default compose(memo, withSearch, withLookup)(SearchBox);
