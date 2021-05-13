import React, { memo } from "react";

import Footer from "./Footer";
import Grid from "@material-ui/core/Grid";
import Header from "./Header";
import Main from "./Main";
import { Router } from "@reach/router";
import classnames from "classnames";
import loadable from "@loadable/component";
import { compose } from "recompose";
import { makeStyles } from "@material-ui/core/styles";

import styles from "./Styles.scss";

const ReportPage = loadable(() => import("./ReportPage"));

const basename = BASENAME || "";

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

const DefaultLayout = () => {
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

const ReportLayout = (props) => {
  return <ReportPage topLevel {...props} />;
};

const Layout = () => {
  let paths = [<DefaultLayout path="/*" />, <ReportLayout path="/reporturl" />];
  console.log("Layout");
  return (
    <>
      <Router className={styles.fillParent} basepath={basename} primary={false}>
        {paths}
      </Router>
    </>
  );
};

export default compose(memo)(Layout);
