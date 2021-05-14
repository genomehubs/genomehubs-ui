import Page from "./Page";
import React from "react";
import qs from "qs";
import ReportFull from "./ReportFull";
import classnames from "classnames";
import styles from "./Styles.scss";

const ReportPage = ({ location, topLevel, ...props }) => {
  let queryString = location.search.replace(/^\?/, "");
  let query = qs.parse(queryString);

  let css = classnames(
    { [styles.infoPanel]: !topLevel },
    { [styles[`infoPanel1Column`]]: !topLevel },
    { [styles.textPanel]: !topLevel },
    styles.fillParent
  );
  let content = (
    <div className={css}>
      <ReportFull
        reportId={queryString}
        report={query.report}
        queryString={queryString}
        topLevel={topLevel}
      />
    </div>
  );
  return <Page searchBox={!topLevel} topLevel={topLevel} text={content} />;
};

export default ReportPage;
