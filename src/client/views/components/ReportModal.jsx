import React, { Fragment, useLayoutEffect, useRef, useState } from "react";
import { saveSvgAsPng, svgAsDataUri } from "save-svg-as-png";

import { findDOMNode } from "react-dom";
import CloseIcon from "@material-ui/icons/Close";
import GetAppIcon from "@material-ui/icons/GetApp";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import ReplayIcon from "@material-ui/icons/Replay";

import EditIcon from "@material-ui/icons/Edit";
import SearchIcon from "@material-ui/icons/Search";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import classnames from "classnames";
import { compose } from "recompose";
import styles from "./Styles.scss";
import { makeStyles } from "@material-ui/core/styles";
import useWindowDimensions from "../hooks/useWindowDimensions";
import withApiUrl from "../hocs/withApiUrl";
import dispatchReport from "../hocs/dispatchReport";
import Report from "./Report";
import ReportEdit from "./ReportEdit";
import ReportQuery from "./ReportQuery";

function getModalStyle() {
  return {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    backgroundColor: theme.palette.background.paper,
    border: "none",
    boxShadow: "none",
    padding: "10px",
    overflow: "visible",
    "&:focus": {
      outline: "none",
    },
  },
  img: {},
}));

export const ReportModal = ({
  reportId,
  report,
  queryString,
  heading,
  caption,
  children,
  fetchReport,
}) => {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [query, setQuery] = useState(false);
  const windowDimensions = useWindowDimensions();
  const chartRef = useRef();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  let height = windowDimensions.height * 0.75;
  let width = windowDimensions.width * 0.75;

  const body = (
    <Grid
      container
      direction="row"
      style={{ ...modalStyle, height, width, flexGrow: 1 }}
      className={classnames(classes.paper, styles.markdown)}
    >
      <Grid item xs={1} />
      <Grid
        item
        xs={edit || query ? 5 : 10}
        align="center"
        style={{ height: "100%", width: "100%" }}
      >
        <Report
          reportId={queryString}
          report={report}
          // queryString={queryString}
          inModal
          chartRef={chartRef}
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
            <CloseIcon onClick={handleClose} style={{ cursor: "pointer" }} />
          </Grid>
          <Grid item align="right">
            <EditIcon
              onClick={() => setEdit(!edit)}
              style={{ cursor: "pointer" }}
            />
          </Grid>
          <Grid item align="right">
            <SearchIcon
              onClick={() => setQuery(!query)}
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
  return (
    <div onClick={handleOpen} style={{ height: "100%", width: "100%" }}>
      <div
        style={{
          cursor: open ? "default" : "pointer",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            pointerEvents: open ? "auto" : "none",
            height: "100%",
            width: "100%",
          }}
        >
          {children}
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        container={() => document.getElementById("theme-base")}
        aria-labelledby="file-modal-title"
        aria-describedby="file-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
};

export default compose(withApiUrl, dispatchReport)(ReportModal);
