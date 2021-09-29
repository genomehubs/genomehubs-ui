import React, { useRef, useState } from "react";

import AddIcon from "@material-ui/icons/Add";
import BasicComplete from "./BasicComplete";
import BasicSelect from "./BasicSelect";
import BasicTextField from "./BasicTextField";
import Button from "@material-ui/core/Button";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";
import QueryBuilder from "./QueryBuilder";
import SearchIcon from "@material-ui/icons/Search";
import SearchSettings from "./SearchSettings";
import Switch from "@material-ui/core/Switch";
import Terms from "./Terms";
import TocIcon from "@material-ui/icons/Toc";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import VariableFilter from "./VariableFilter";
import { compose } from "recompose";
import { makeStyles } from "@material-ui/core/styles";
import qs from "qs";
import styles from "./Styles.scss";
import { useNavigate } from "@reach/router";
import withLookup from "../hocs/withLookup";
import withSearch from "../hocs/withSearch";
import withSearchDefaults from "../hocs/withSearchDefaults";
import withTaxonomy from "../hocs/withTaxonomy";
import withTypes from "../hocs/withTypes";

function getModalStyle() {
  return {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };
}

export const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: 400,
    maxWidth: "75vw",
    maxHeight: "75vh",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

// const handleValueChange =

const SearchToggles = ({ searchDefaults, setSearchDefaults }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const rootRef = useRef(null);

  return (
    <>
      <Grid container direction="row" ref={rootRef}>
        <Tooltip
          title={`Toggle switch to ${
            searchDefaults.includeDescendants
              ? "exclude descendant taxa from"
              : "include descendant taxa in"
          } results`}
          arrow
          placement={"top"}
        >
          <Grid item xs={3}>
            <FormControl
              className={classes.formControl}
              style={{ margin: "-8px 0 0", transform: "scale(0.75)" }}
            >
              <FormHelperText>
                {searchDefaults.includeDescendants
                  ? "include descendants"
                  : "ignore descendants"}
              </FormHelperText>
              <Switch
                id={"taxon-filter-filter"}
                checked={searchDefaults.includeDescendants}
                onChange={() =>
                  setSearchDefaults({
                    includeDescendants: !searchDefaults.includeDescendants,
                  })
                }
                name="filter-type"
                color="default"
              />
            </FormControl>
          </Grid>
        </Tooltip>
        <Tooltip
          title={`Toggle switch to ${
            searchDefaults.includeEstimates
              ? "exclude estimated values from"
              : "include estimated values in"
          } results`}
          arrow
          placement={"top"}
        >
          <Grid item xs={3}>
            <FormControl
              className={classes.formControl}
              style={{ margin: "-8px 0 0", transform: "scale(0.75)" }}
            >
              <FormHelperText>
                {searchDefaults.includeEstimates
                  ? "include estimates"
                  : "exclude estimates"}
              </FormHelperText>
              <Switch
                id={"estimated-values-filter"}
                checked={searchDefaults.includeEstimates}
                onChange={() =>
                  setSearchDefaults({
                    includeEstimates: !searchDefaults.includeEstimates,
                  })
                }
                name="include-estimates"
                color="default"
              />
            </FormControl>
          </Grid>
        </Tooltip>
        <Tooltip
          title={`Click show example search terms`}
          arrow
          placement={"top"}
        >
          <Grid
            item
            xs={2}
            onClick={() => setShowExamples(!showExamples)}
            style={{ cursor: "pointer" }}
          >
            <FormControl
              className={classes.formControl}
              style={{ margin: "-8px 0 0", transform: "scale(0.75)" }}
            >
              <FormHelperText>search examples</FormHelperText>
              <IconButton aria-label="result settings" size="small">
                <HelpIcon />
              </IconButton>
            </FormControl>
            {/* <Modal
            open={showSettings}
            onClose={() => setShowExamples(false)}
            aria-labelledby="result-settings-modal-title"
            aria-describedby="result-settings-modal-description"
            className={classes.modal}
            container={() => rootRef.current}
          >
            <DialogContent className={classes.paper}>
              <SearchSettings />
            </DialogContent>
          </Modal> */}
          </Grid>
        </Tooltip>
        <Tooltip title={`Click to set result columns`} arrow placement={"top"}>
          <Grid
            item
            xs={2}
            onClick={() => setShowSettings(true)}
            style={{ cursor: "pointer" }}
          >
            <FormControl
              className={classes.formControl}
              style={{ margin: "-8px 0 0", transform: "scale(0.75)" }}
            >
              <FormHelperText>result columns</FormHelperText>
              <IconButton aria-label="result settings" size="small">
                <TocIcon />
              </IconButton>
            </FormControl>
            <Modal
              open={showSettings}
              onClose={() => setShowSettings(false)}
              aria-labelledby="result-settings-modal-title"
              aria-describedby="result-settings-modal-description"
              className={classes.modal}
              container={() => rootRef.current}
            >
              <DialogContent className={classes.paper}>
                <SearchSettings />
              </DialogContent>
            </Modal>
          </Grid>
        </Tooltip>
        <Tooltip title={`Click to show query builder`} arrow placement={"top"}>
          <Grid
            item
            xs={2}
            onClick={() => setShowOptions(true)}
            style={{ cursor: "pointer" }}
          >
            <FormControl
              className={classes.formControl}
              style={{ margin: "-8px 0 0", transform: "scale(0.75)" }}
            >
              <FormHelperText>query builder</FormHelperText>
              <IconButton
                aria-label="query builder"
                size="small"
                onClick={() => {}}
              >
                <ControlPointIcon />
              </IconButton>
            </FormControl>
            <Modal
              open={showOptions}
              onClose={() => setShowOptions(false)}
              aria-labelledby="search-options-modal-title"
              aria-describedby="search-options-modal-description"
              className={classes.modal}
              container={() => rootRef.current}
            >
              <DialogContent className={classes.paper}>
                <QueryBuilder />
              </DialogContent>
            </Modal>
          </Grid>
        </Tooltip>
      </Grid>
      {showExamples && <Terms />}
    </>
  );
};

export default compose(withSearch, withSearchDefaults)(SearchToggles);
