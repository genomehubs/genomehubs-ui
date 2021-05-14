import React, { useState } from "react";
import { compose } from "recompose";
import withReportById from "../hocs/withReportById";
import JSONPretty from "react-json-pretty";
import JSONPrettyMon from "react-json-pretty/dist/monikai";

export const ReportCode = ({ reportId, reportById, report, queryString }) => {
  if (!reportById.report || !reportById.report.queryString) {
    return null;
  }

  return (
    <code style={{ textAlign: "left" }}>
      <JSONPretty
        id="json-pretty"
        theme={JSONPrettyMon}
        data={reportById.report}
      ></JSONPretty>
    </code>
  );
};

export default compose(withReportById)(ReportCode);
