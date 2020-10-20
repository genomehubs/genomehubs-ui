import React from "react";
import { connect } from "react-redux";

const title = SITENAME || "GoaT UI";

const withTitle = (WrappedComponent) => (props) => {
  const mapStateToProps = (state) => ({
    title,
  });

  const Connected = connect(mapStateToProps)(WrappedComponent);

  return <Connected {...props} />;
};

export default withTitle;
