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
  setSearchTerm,
  setPreferSearchTerm,
}) => {
  if (!searchResults.status || !searchResults.status.hits) {
    return null;
  }
  let pageSize = searchResults.status.size;
  let offset = searchResults.status.offset;
  let resultCount = searchResults.status.hits;
  let count = Math.ceil(resultCount / pageSize);
  let page = offset / pageSize;
  let options = { ...searchTerm };
  const handleChange = (event, newPage) => {
    options.offset = newPage * pageSize;
    console.log(options.offset);
    setPreferSearchTerm(true);
    setSearchTerm(options);
  };
  const handleChangeRowsPerPage = (event) => {
    options.offset = 0;
    options.size = parseInt(event.target.value, 10);
    setPreferSearchTerm(true);
    setSearchTerm(options);
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
