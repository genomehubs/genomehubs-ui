import { downloadReport, saveReport } from "../selectors/report";
import { saveSvgAsPng, svgAsDataUri } from "save-svg-as-png";

import DownloadButton from "./DownloadButton";
import GetAppIcon from "@material-ui/icons/GetApp";
import Grid from "@material-ui/core/Grid";
import React from "react";
import { compose } from "recompose";
import qs from "qs";
import withApiUrl from "../hocs/withApiUrl";
import withReportById from "../hocs/withReportById";

export const ReportDownload = ({
  reportById,
  report,
  chartRef,
  code,
  apiUrl,
  queryString,
}) => {
  if (!reportById.report || !reportById.report[report]) {
    return null;
  }

  const exportChart = ({ options, format, filename = "report" }) => {
    const downloadLink = (uri, filename) => {
      const link = document.createElement("a");
      link.href = uri;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    };

    let chartSVG;
    if (format == "png" || format == "svg") {
      if (chartRef.current && chartRef.current.children) {
        chartSVG = chartRef.current.childNodes[0].childNodes[0];
      } else {
        return;
      }
      chartSVG = React.Children.only(chartSVG);
      let { x: left, y: top, height, width } = chartSVG.viewBox.baseVal;
      let opts = {
        excludeCss: true,
        scale: 2,
        backgroundColor: "white",
        left,
        top,
        height,
        width,
      };
      if (format == "png") {
        saveSvgAsPng(chartSVG, `${filename}.png`, opts);
      } else if (format == "svg") {
        svgAsDataUri(chartSVG, opts).then((uri) => {
          downloadLink(uri, `${filename}.svg`);
        });
      }
      return;
    } else if (format) {
      saveReport(options, format);
    }
  };

  const handleClick = (options, format) => {
    if (format) {
      exportChart({ options, format });
    }
  };

  let options = {
    PNG: { format: "png" },
    SVG: { format: "svg" },
    JSON: { format: "json" },
    ...(report == "tree" && {
      Newick: { format: "nwk" },
      PhyloXML: { format: "xml" },
      ZIP: { format: "zip" },
    }),
  };

  return (
    <Grid
      container
      direction="column"
      style={{ height: "100%", width: "100%" }}
    >
      <Grid item align="right">
        {/* <GetAppIcon
          onClick={(e) => {
            if (code) {
              exportChart(e, "json");
            } else {
              exportChart();
            }
          }}
          style={{ cursor: "pointer" }}
        /> */}
        <DownloadButton
          onButtonClick={handleClick}
          searchTerm={qs.parse(queryString)}
          options={options}
        />
      </Grid>
    </Grid>
  );
};

export default compose(withApiUrl, withReportById)(ReportDownload);
