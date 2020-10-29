import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import withSearch from "../hocs/withSearch";
import { makeStyles } from "@material-ui/core/styles";
// import Pagination from "@material-ui/lab/Pagination";
import TablePagination from "@material-ui/core/TablePagination";

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
  let page = offset / pageSize;
  const handleChange = (event, newPage) => {
    searchTerm.offset = newPage * pageSize;
    fetchSearchResults(searchTerm);
  };
  const handleChangeRowsPerPage = (event) => {
    searchTerm.offset = 0;
    searchTerm.size = parseInt(event.target.value, 10);
    fetchSearchResults(searchTerm);
  };

  return (
    <div
      style={{
        flex: "0 1 auto",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={resultCount}
        rowsPerPage={pageSize}
        page={page}
        onChangePage={handleChange}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default compose(withSearch)(SearchPagination);
