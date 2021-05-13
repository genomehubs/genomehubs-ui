import React from "react";
import Grid from "@material-ui/core/Grid";
import { compose } from "recompose";
import withReportById from "../hocs/withReportById";

export const ReportInfo = ({ reportById, report }) => {
  if (!reportById.report || !reportById.report[report]) {
    return null;
  }

  let caption = reportById.report.caption;
  return (
    <Grid
      container
      direction="column"
      style={{ height: "100%", width: "100%" }}
    >
      {caption}
    </Grid>
  );
};

export default compose(withReportById)(ReportInfo);
