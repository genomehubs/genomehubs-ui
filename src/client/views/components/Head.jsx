import React from "react";
import { compose } from "recompose";
import { Helmet } from "react-helmet";
import withTitle from "../hocs/withTitle";

const Head = ({ title }) => {
  return (
    <Helmet>
      <meta charset="utf8" />
      <title>{title}</title>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.0.1/dist/leaflet.css"
      />
    </Helmet>
  );
};

export default compose(withTitle)(Head);
