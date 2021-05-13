import Page from "./Page";
import React from "react";
import qs from "qs";
import ReportFull from "./ReportFull";
import classnames from "classnames";
import styles from "./Styles.scss";

const ReportPage = ({ location, ...props }) => {
  let queryString = location.search.replace(/^\?/, "");
  let query = qs.parse(queryString);

  let css = classnames(
    styles.infoPanel,
    styles[`infoPanel1Column`],
    styles.textPanel,
    styles.fillParent
  );
  let content = (
    <div
      className={css}
      // style={{ height: "fit-content", backgroundColor: "red" }}
    >
      <ReportFull
        reportId={queryString}
        report={query.report}
        queryString={queryString}
      />
    </div>
  );
  return <Page searchBox text={content} />;
};

export default ReportPage;
