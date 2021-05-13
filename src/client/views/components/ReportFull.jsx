import React, { Fragment, useRef, useState } from "react";
import { saveSvgAsPng, svgAsDataUri } from "save-svg-as-png";
import CloseIcon from "@material-ui/icons/Close";
import GetAppIcon from "@material-ui/icons/GetApp";
import LinkIcon from "@material-ui/icons/Link";
import EditIcon from "@material-ui/icons/Edit";
import SearchIcon from "@material-ui/icons/Search";
import Grid from "@material-ui/core/Grid";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import useWindowDimensions from "../hooks/useWindowDimensions";
import Report from "./Report";
import ReportEdit from "./ReportEdit";
import ReportQuery from "./ReportQuery";
import dispatchReport from "../hocs/dispatchReport";
import { useStyles } from "./ReportModal";
import { useNavigate } from "@reach/router";

export const ReportFull = ({
  reportId,
  report,
  queryString,
  fetchReport,
  topLevel,
  modalStyle = {},
  handleClose,
}) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [edit, setEdit] = useState(false);
  const [query, setQuery] = useState(false);
  const chartRef = useRef();
  const containerRef = useRef();

  const windowDimensions = useWindowDimensions();
  let height = windowDimensions.height;
  let width = windowDimensions.width;
  let marginLeft = 0;
  let modal = false;
  if (Object.keys(modalStyle).length > 0) {
    height *= 0.75;
    width *= 0.75;
    modal = true;
  } else {
    marginLeft = width * -0.05;
    width *= 0.9;
  }

  const downloadLink = (uri, filename) => {
    const link = document.createElement("a");
    link.href = uri;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const exportChart = (e, format = "png", filename = "report") => {
    let chartSVG;
    if (chartRef.current && chartRef.current.children) {
      chartSVG = chartRef.current.childNodes[0].childNodes[0];
    } else {
      return;
    }
    chartSVG = React.Children.only(chartSVG);
    let opts = {
      excludeCss: true,
      scale: 2,
      backgroundColor: "white",
    };
    if (format == "png") {
      saveSvgAsPng(chartSVG, `${filename}.png`, opts);
    } else if (format == "svg") {
      svgAsDataUri(chartSVG, opts).then((uri) => {
        downloadLink(uri, `${filename}.svg`);
      });
    }
  };

  const permaLink = (queryString, toggle) => {
    let path = modal || topLevel ? "report" : toggle ? "reporturl" : "report";
    navigate(`/${path}?${queryString}`);
  };

  let content = (
    <Grid
      container
      direction="row"
      style={{ ...(modal && { ...modalStyle }), height, width, flexGrow: 1 }}
      className={classnames(classes.paper, styles.markdown)}
    >
      <Grid item xs={1} />
      <Grid
        item
        xs={edit || query ? 5 : 10}
        align="center"
        ref={containerRef}
        style={{ height: "100%", width: "100%" }}
      >
        <Report
          reportId={queryString}
          report={report}
          queryString={queryString}
          inModal
          chartRef={chartRef}
          containerRef={containerRef}
        />
      </Grid>
      {edit && (
        <Fragment>
          <Grid item xs={1} />
          <Grid
            item
            xs={4}
            align="center"
            style={{ height: "100%", width: "100%" }}
          >
            <ReportEdit
              reportId={reportId}
              report={report}
              fetchReport={fetchReport}
              modal={modal}
              permaLink={permaLink}
            />
          </Grid>
        </Fragment>
      )}
      {query && (
        <Fragment>
          <Grid item xs={1} />
          <Grid
            item
            xs={4}
            align="center"
            style={{ height: "100%", width: "100%" }}
          >
            <ReportQuery reportId={reportId} report={report} />
          </Grid>
        </Fragment>
      )}
      <Grid item xs={1}>
        <Grid container direction="column">
          <Grid item align="right">
            {handleClose && (
              <CloseIcon onClick={handleClose} style={{ cursor: "pointer" }} />
            )}
          </Grid>
          {!topLevel && (
            <Grid item align="right">
              <EditIcon
                onClick={() => {
                  setQuery(false);
                  setEdit(!edit);
                }}
                style={{ cursor: "pointer" }}
              />
            </Grid>
          )}
          {!topLevel && (
            <Grid item align="right">
              <SearchIcon
                onClick={() => {
                  setEdit(false);
                  setQuery(!query);
                }}
                style={{ cursor: "pointer" }}
              />
            </Grid>
          )}
          <Grid item align="right">
            <LinkIcon
              onClick={() => {
                permaLink(queryString, true);
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid>
          <Grid item align="right">
            <GetAppIcon onClick={exportChart} style={{ cursor: "pointer" }} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  return <div style={{ marginLeft, height, width }}>{content}</div>;
};

export default compose(dispatchReport)(ReportFull);
