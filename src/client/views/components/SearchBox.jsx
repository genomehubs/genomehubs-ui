import React, { memo } from "react";
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
import Grid from "@material-ui/core/Grid";
import Popper from "@material-ui/core/Popper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";

// import parse from "autosuggest-highlight/parse";
// import throttle from "lodash/throttle";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
}));

const PlacedPopper = (props) => {
  return <Popper {...props} placement="top" />;
};

// export default function GoogleMaps() {
//   const classes = useStyles();
//   const [value, setValue] = React.useState(null);
//   const [inputValue, setInputValue] = React.useState('');
//   const [options, setOptions] = React.useState([]);

//   return (

//   );
// }

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

  const dispatchSearch = (options) => {
    fetchSearchResults(options);
    navigate(`search?${qs.stringify(options)}`);
  };

  const doSearch = (query, result = "taxon") => {
    // setLookupTerm(query);
    dispatchSearch({ query, result });
    resetLookup();
  };
  // const updateSearch = (query, result = "taxon") => {
  //   dispatchSearch({ query, result });
  //   setLookupTerm(query);
  //   setTimeout(resetLookup, 100);
  // };
  const updateTerm = (value, result = "taxon") => {
    setLookupTerm(value);
    fetchLookup(value, result);
  };
  const handleChange = (e, newValue) => {
    if (newValue != lookupTerm) {
      updateTerm(newValue);
    }
  };
  const handleKeyDown = (e, newValue) => {
    doSearch(newValue.title);
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
  let suggestions;
  if (
    lookupTerms.status &&
    lookupTerms.status.success &&
    lookupTerms.suggestions &&
    lookupTerms.suggestions.length > 0 &&
    !/[\(\)<>=]/.test(lookupTerm)
  ) {
    suggestions = [<div key={"x"}>Did you mean:</div>];
    lookupTerms.suggestions.forEach((suggestion, i) => {
      let value = suggestion.suggestion.text;
      suggestions.push(
        <div key={i} className={styles.term} onClick={() => updateTerm(value)}>
          <span className={styles.value}>{value}</span>?
        </div>
      );
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
      <div
        style={{
          width: "600px",
          flex: "0 1 auto",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Autocomplete
          id="main-search"
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.title
          }
          getOptionSelected={(option, value) => option.title === value.title}
          options={options}
          autoComplete
          includeInputInList
          freeSolo
          value={lookupTerm}
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
            return (
              <Grid container alignItems="center">
                <Grid item>
                  <LocationOnIcon className={classes.icon} />
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
                  </Typography>
                </Grid>
              </Grid>
            );
          }}
        />
      </div>
    </div>
  );
  // return (
  //   <div
  //     className={styles.flexColumn}
  //     style={{
  //       height: "6em",
  //       minWidth: "600px",
  //       overflow: "visible",
  //       zIndex: 10,
  //     }}
  //   >
  //     <div
  //       className={styles.fullWidth}
  //       style={{
  //         textAlign: "center",
  //       }}
  //     >
  //       <input
  //         type="text"
  //         placeholder={`Search ${siteName}`}
  //         className={classnames(styles.searchBox, styles.fullWidth)}
  //         value={lookupTerm}
  //         onChange={handleChange}
  //         onKeyPress={handleKeyDown}
  //         autoComplete="off"
  //         autoCapitalize="off"
  //         autoCorrect="off"
  //         spellCheck="false"
  //       ></input>
  //     </div>
  //     {(terms || suggestions) && (
  //       <div className={styles.completion}>
  //         {terms}
  //         {suggestions}
  //       </div>
  //     )}
  //   </div>
  // );
};

export default compose(memo, withSearch, withLookup)(SearchBox);
