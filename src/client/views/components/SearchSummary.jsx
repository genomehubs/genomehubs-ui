import React from "react";
import { compose } from "recompose";
import styles from "./Styles.scss";
import classnames from "classnames";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import Skeleton from "@material-ui/lab/Skeleton";

const SearchSummary = ({ searchTerm, searchResults }) => {
  if (!searchResults.status || !searchResults.status.hasOwnProperty("hits")) {
    return null;
  }
  const count = searchResults.status.hits;
  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.resultPanel,
    styles.flexCenter,
    styles.flexCenterHorizontal,
    styles.fullWidth
  );

  let summary;

  return (
    <div className={css}>
      <Grid container alignItems="center">
        {searchResults.isFetching ? (
          <Grid item style={{ minWidth: "150px" }}>
            <Skeleton variant="text" />
          </Grid>
        ) : (
          <Grid item>
            {count} result{count >= 1 ? (count == 1 ? ":" : "s:") : "s"}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default compose(withTypes, withSearch)(SearchSummary);