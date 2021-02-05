import React, { memo } from "react";

import Footer from "./Footer";
import Grid from "@material-ui/core/Grid";
import Header from "./Header";
import Main from "./Main";
import classnames from "classnames";
import { compose } from "recompose";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  },
  item: {
    minWidth: "100%",
    maxWidth: "100%",
  },
  footer: {
    minWidth: "100%",
    maxWidth: "100%",
  },
}));

const Layout = () => {
  const classes = useStyles();
  return (
    <Grid
      container
      className={classes.container}
      spacing={0}
      direction="column"
    >
      <Grid item className={classes.item} xs={1}>
        <Header />
      </Grid>
      <Grid item className={classes.item} xs={true}>
        <Main />
      </Grid>
      <Grid item className={classes.item} xs={1}>
        <Footer />
      </Grid>
    </Grid>
  );
};

export default compose(memo)(Layout);
