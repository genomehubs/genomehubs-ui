import React from "react";
import { compose } from "recompose";
import styles from "./Styles.scss";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
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
  types,
}) => {
  if (!searchResults.status || !searchResults.status.hits) {
    return null;
  }
  let pageSize = searchResults.status.size;
  let sortBy = searchTerm.sortBy || "";
  let sortOrder = searchTerm.sortOrder || "asc";

  const handleChange = (event) => {
    if (event.target.value != "") {
      searchTerm[event.target.name] = event.target.value;
    } else {
      delete searchTerm[event.target.name];
    }
    fetchSearchResults(searchTerm);
  };
  const classes = useStyles();
  let sortMenuItems = [];
  Object.keys(types).forEach((type) => {
    if (types[type].display_level == 1) {
      sortMenuItems.push(
        <MenuItem key={type} value={type}>
          {type}
        </MenuItem>
      );
    }
  });
  let sortBySelect = (
    <FormControl className={classes.formControl}>
      <InputLabel id="sort-by-label">sort by</InputLabel>
      <Select
        labelId="sort-by-label"
        id="sort-by"
        name={"sortBy"}
        value={sortBy}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {sortMenuItems}
      </Select>
    </FormControl>
  );
  let sortOrderSelect = (
    <FormControl className={classes.formControl}>
      <InputLabel id="sort-order-label">sort order</InputLabel>
      <Select
        labelId="sort-order-label"
        id="sort-order"
        name={"sortOrder"}
        value={sortOrder}
        onChange={handleChange}
      >
        <MenuItem value={"asc"}>ascending</MenuItem>
        <MenuItem value={"desc"}>descending</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <div className={styles.disableTheme}>
      {sortBySelect}
      {sortOrderSelect}
    </div>
  );
};

export default compose(withTypes, withSearch)(SearchOptions);
