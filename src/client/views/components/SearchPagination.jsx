import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import withSearch from "../hocs/withSearch";
import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      marginTop: theme.spacing(2),
    },
  },
}));

const SearchPagination = ({
  searchTerm,
  searchResults,
  fetchSearchResults,
}) => {
  if (!searchResults.status || !searchResults.status.hits) {
    return null;
  }
  let pageSize = searchResults.status.size;
  let offset = searchResults.status.offset;
  let resultCount = searchResults.status.hits;
  let count = Math.ceil(resultCount / pageSize);
  let page = offset / pageSize + 1;
  const handleChange = (event, newPage) => {
    searchTerm.offset = (newPage - 1) * pageSize;
    fetchSearchResults(searchTerm);
  };

  return (
    <div className={styles.disableTheme}>
      <Pagination count={count} page={page} onChange={handleChange} />
    </div>
  );
};

export default compose(withSearch)(SearchPagination);
