import React, { Fragment, useRef, useState } from "react";
import { useLocation, useNavigate } from "@reach/router";

import CloseIcon from "@material-ui/icons/Close";
import CodeIcon from "@material-ui/icons/Code";
import EditIcon from "@material-ui/icons/Edit";
import GetAppIcon from "@material-ui/icons/GetApp";
import Grid from "@material-ui/core/Grid";
import HelpIcon from "@material-ui/icons/HelpOutline";
import LinkIcon from "@material-ui/icons/Link";
import Report from "./Report";
import ReportCode from "./ReportCode";
import ReportDownload from "./ReportDownload";
import ReportEdit from "./ReportEdit";
import ReportInfo from "./ReportInfo";
import ReportQuery from "./ReportQuery";
import SearchIcon from "@material-ui/icons/Search";
import classnames from "classnames";
import { compose } from "recompose";
import dispatchReport from "../hocs/dispatchReport";
import { sortReportQuery } from "../selectors/report";
import styles from "./Styles.scss";
import { useStyles } from "./ReportModal";
import useWindowDimensions from "../hooks/useWindowDimensions";

export const ReportFull = ({
  reportId,
  report,
  queryString,
  fetchReport,
  topLevel,
  modalStyle = {},
  handleClose,
  error = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const [code, setCode] = useState(false);
  const [edit, setEdit] = useState(false);
  const [query, setQuery] = useState(false);
  const [download, setDownload] = useState(false);
  const [info, setInfo] = useState(false);
  const chartRef = useRef();
  const containerRef = useRef();
  const reportRef = useRef(null);
  const gridRef = useRef(null);

  const windowDimensions = useWindowDimensions();
  let height = windowDimensions.height;
  let width = windowDimensions.width;
  let marginLeft = 0;
  let modal = false;
  if (Object.keys(modalStyle).length > 0) {
    height *= 0.75;
    width *= 0.75;
    modal = true;
  } else if (topLevel) {
    width *= 0.96;
    height *= 0.96;
  } else {
    marginLeft = width * -0.05;
    width *= 0.9;
    height *= 0.9;
  }

  const permaLink = (queryString, toggle) => {
    let path = modal || topLevel ? "report" : toggle ? "reporturl" : "report";
    // TODO: include taxonomy
    navigate(`/${path}?${queryString.replace(/^\?/, "")}`);
  };

  const handleUpdate = ({ queryString, hash }) => {
    if (hash && !hash.startsWith("#")) {
      hash = "#" + hash;
    } else {
      hash = hash || "";
    }
    navigate(`${location.pathname}?${queryString.replace(/^\?/, "")}${hash}`);
  };

  let reportComponent;

  if (code) {
    reportComponent = (
      <div style={{ height: "100%", width: "100%", overflow: "auto" }}>
        <ReportCode
          reportId={reportId}
          report={report}
          queryString={queryString}
        />
      </div>
    );
  } else {
    reportComponent = (
      <Report
        reportId={reportId}
        report={report}
        queryString={queryString}
        inModal
        chartRef={chartRef}
        containerRef={containerRef}
        reportRef={reportRef}
        gridRef={gridRef}
        topLevel={topLevel}
        permaLink={permaLink}
        handleUpdate={handleUpdate}
        setEdit={setEdit}
      />
    );
  }
  let content = (
    <Grid
      container
      direction="row"
      style={{
        ...(modal && { ...modalStyle }),
        height,
        width,
        flexGrow: 1,
        maxHeight: "100%",
      }}
      className={classnames(classes.paper, styles.markdown)}
      ref={gridRef}
    >
      <Grid item xs={1} />
      <Grid
        item
        xs={edit || query || info || download ? 5 : 10}
        align="center"
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      >
        {reportComponent}
      </Grid>
      {edit && !query && !info && !download && (
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
              handleUpdate={handleUpdate}
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
      {info && (
        <Fragment>
          <Grid item xs={1} />
          <Grid
            item
            xs={4}
            align="center"
            style={{ height: "100%", width: "100%" }}
          >
            <ReportInfo reportId={reportId} report={report} />
          </Grid>
        </Fragment>
      )}
      {download && (
        <Fragment>
          <Grid item xs={1} />
          <Grid
            item
            xs={4}
            align="center"
            style={{ height: "100%", width: "100%" }}
          >
            <ReportDownload
              reportId={reportId}
              report={report}
              chartRef={chartRef}
              code={code}
              queryString={queryString}
            />
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
                  setInfo(false);
                  setQuery(false);
                  setDownload(false);
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
                  setInfo(false);
                  setEdit(false);
                  setDownload(false);
                  setQuery(!query);
                }}
                style={{ cursor: "pointer" }}
              />
            </Grid>
          )}
          <Grid item align="right">
            <HelpIcon
              onClick={() => {
                setInfo(!info);
                setEdit(false);
                setDownload(false);
                setQuery(false);
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid>

          <Grid item align="right">
            <LinkIcon
              onClick={() => {
                permaLink(queryString, true);
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid>
          <Grid item align="right">
            <CodeIcon
              onClick={(e) => {
                setCode(!code);
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid>
          {/* <Grid item align="right">
            <GetAppIcon
              onClick={(e) => {
                if (code) {
                  exportChart(e, "json");
                } else {
                  exportChart();
                }
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid> */}
          <Grid item align="right">
            <GetAppIcon
              onClick={() => {
                setInfo(false);
                setEdit(false);
                setDownload(!download);
                setQuery(false);
              }}
              style={{ cursor: "pointer" }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  return (
    <div
      style={{ marginLeft, height, width, maxHeight: "100%" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      ref={reportRef}
    >
      {content}
    </div>
  );
};

export default compose(dispatchReport)(ReportFull);
