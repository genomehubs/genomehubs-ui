import React, { memo, useRef, useState } from "react";

import Autocomplete from "@material-ui/lab/Autocomplete";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
// import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
// import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Grid from "@material-ui/core/Grid";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import IconButton from "@material-ui/core/IconButton";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Popper from "@material-ui/core/Popper";
import SearchIcon from "@material-ui/icons/Search";
import SearchOptions from "./SearchOptions";
import SearchSettings from "./SearchSettings";
import SettingsIcon from "@material-ui/icons/Settings";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import { compose } from "recompose";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { findDOMNode } from "react-dom";
import { makeStyles } from "@material-ui/core/styles";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: "600px",
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
  let secondaryText;
  if (option.name_class) {
    secondaryText = (
      <Typography variant="body2" color="textSecondary">
        {option.taxon_rank}
        {option.name_class != "scientific name" &&
          option.name_class != "taxon ID" && (
            <span> :: {option.scientific_name}</span>
          )}
      </Typography>
    );
  } else if (option.identifier_class) {
    secondaryText = (
      <Typography variant="body2" color="textSecondary">
        {option.scientific_name}
      </Typography>
    );
  }

  return (
    <Grid container alignItems="center">
      <Grid item>
        <SearchIcon className={classes.icon} />
      </Grid>
      <Grid item xs>
        <div>{option.title}</div>
        <span style={{ float: "right" }}>
          <Typography variant="body2" color="textSecondary">
            {(option.name_class && option.taxon_id) || option.assembly_id}
          </Typography>
        </span>
        {secondaryText}
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
  setSearchIndex,
  searchIndex,
  searchTerm,
  setPreferSearchTerm,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  let [open, setOpen] = useState(false);
  let [multiline, setMultiline] = useState(() => {
    if (searchTerm && searchTerm.query && searchTerm.query.match(/[\r\n]/)) {
      return true;
    }
    return false;
  });
  let [showOptions, setShowOptions] = useState(false);
  let [showSettings, setShowSettings] = useState(false);
  let [result, setResult] = useState(searchIndex);
  let fields = searchTerm.fields;
  const dispatchSearch = (options, term) => {
    fetchSearchResults(options);
    setPreferSearchTerm(false);
    navigate(`search?${qs.stringify(options)}#${encodeURIComponent(term)}`);
  };

  const doSearch = (query, result, term) => {
    setSearchIndex(result);
    dispatchSearch({ query, result, fields }, term);
    resetLookup();
  };
  const updateTerm = (value) => {
    setLookupTerm(value);
    fetchLookup(value);
  };
  const handleChange = (e, newValue) => {
    if (newValue != lookupTerm) {
      if (!newValue.match(/[\r\n]/)) {
        setMultiline(false);
        updateTerm(newValue);
        setOpen(true);
      } else if (!multiline) {
        updateTerm(newValue);
        setOpen(true);
      }
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        setMultiline(true);
        setLookupTerm(`${lookupTerm}\n`);
      } else if (!multiline) {
        handleSubmit(e);
      }
    }
  };
  // const handleMultilineChange = (e, x) => {
  //   if (!e.target.value.match(/[\r\n]/)) {
  //     setMultiline(false);
  //   }
  //   setLookupTerm(e.target.value);
  // };
  const handleKeyDown = (e, newValue) => {
    if (newValue) {
      if (newValue.highlighted) {
        setOpen(true);
      } else {
        setOpen(false);
        setResult(newValue.result);
        doSearch(
          newValue.unique_term || e.target.value,
          newValue.result || "taxon",
          newValue.title || e.target.value
        );
      }
    } else {
      resetLookup();
      setMultiline(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let term = searchInputRef.current.value;
    doSearch(term, result, term);
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
      if (lookupTerms.status.result == "taxon") {
        if (result.reason) {
          value = result.reason[0].fields["taxon_names.name.raw"][0];
        } else {
          value = result.result.scientific_name;
        }
        options.push({
          title: value,
          result: "taxon",
          unique_term: result.result.taxon_id,
          taxon_id: result.result.taxon_id,
          taxon_rank: result.result.taxon_rank,
          scientific_name: result.result.scientific_name,
          name_class: result.reason
            ? result.reason[0].fields["taxon_names.class"]
            : "taxon ID",
        });
        terms.push(
          <div key={i} className={styles.term}>
            <span className={styles.value}>{value}</span>
            <div
              className={styles.extra}
            >{`\u2014 ${result.result.taxon_rank}`}</div>
          </div>
        );
      } else if (lookupTerms.status.result == "assembly") {
        if (result.reason) {
          value = result.reason[0].fields["identifiers.identifier.raw"][0];
        } else {
          value = result.result.assembly_id;
        }
        options.push({
          title: value,
          result: "assembly",
          unique_term: result.result.assembly_id,
          taxon_id: result.result.taxon_id,
          scientific_name: result.result.scientific_name,
          assembly_id: result.result.assembly_id,
          identifier_class: result.reason
            ? result.reason[0].fields["identifiers.class"]
            : "assembly ID",
        });
        terms.push(
          <div key={i} className={styles.term}>
            <span className={styles.value}>{value}</span>
            <div
              className={styles.extra}
            >{`\u2014 ${result.result.scientific_name}`}</div>
          </div>
        );
      }
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
          minWidth: "800px",
          flex: "0 1 auto",
          position: "absolute",
          marginRight: "100px",
          left: "50%",
          transform: "translateX(calc(100px - 50%))",
        }}
      >
        <Grid container alignItems="center" direction="row">
          <Grid item style={{ width: "600px" }} ref={searchBoxRef}>
            <FormControl className={classes.formControl}>
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
                    onKeyPress={handleKeyPress}
                    {...params}
                    inputRef={searchInputRef}
                    label={`Search ${siteName}`}
                    variant="outlined"
                    fullWidth
                    multiline
                    rowsMax={3}
                  />
                )}
                renderOption={(option) => {
                  if (option.highlighted) {
                    return <AutoCompleteSuggestion option={option} />;
                  }
                  return <AutoCompleteOption option={option} />;
                }}
              />
              <FormHelperText
                labelPlacement="end"
                onClick={() => {
                  setShowOptions(!showOptions);
                  setShowSettings(false);
                }}
                style={{ textAlign: "right", cursor: "pointer" }}
              >
                Advanced search
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item>
            <IconButton
              className={classes.search}
              aria-label="submit search"
              type="submit"
            >
              <SearchIcon />
            </IconButton>
          </Grid>
          <Grid item>
            {/* <IconButton
              className={classes.search}
              aria-label="expand row"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton> */}
            <IconButton
              className={classes.search}
              aria-label="search settings"
              onClick={() => {
                setShowSettings(!showSettings);
                setShowOptions(false);
              }}
            >
              <SettingsIcon
                style={{ transform: showSettings ? "rotate(90deg)" : "" }}
              />
            </IconButton>
          </Grid>
        </Grid>
        <Popper
          id={"search-options"}
          open={showOptions}
          anchorEl={searchBoxRef.current}
          placement={"bottom"}
        >
          <SearchOptions />
        </Popper>
        <Popper
          id={"search-settings"}
          style={{ maxWidth: "800px" }}
          open={showSettings}
          anchorEl={searchBoxRef.current}
          placement={"bottom"}
        >
          <SearchSettings />
        </Popper>
      </form>
    </div>
  );
};

export default compose(memo, withSearch, withLookup)(SearchBox);
