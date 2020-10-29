import React from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import { CookiesProvider } from "react-cookie";
import { withCookies } from "react-cookie";
import withFadeInOut from "../hocs/withFadeInOut";
import withTheme from "../hocs/withTheme";
import { StylesProvider } from "@material-ui/core/styles";
import Layout from "./Layout";
import Head from "./Head";

const App = ({ theme, cookies }) => {
  return (
    <StylesProvider injectFirst>
      <div className={classnames(`theme${theme}`, styles.app)}>
        <Head />
        <CookiesProvider>
          <Layout cookies={cookies} />
        </CookiesProvider>
      </div>
    </StylesProvider>
  );
};

export default compose(withCookies, withTheme, withFadeInOut)(App);
