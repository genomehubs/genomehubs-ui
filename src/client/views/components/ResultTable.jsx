import React, { useState } from "react";
import { compose } from "recompose";
import classnames from "classnames";
import styles from "./Styles.scss";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Box from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import SaveIcon from "@material-ui/icons/Save";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";
import { formatter } from "../functions/formatter";
import AggregationIcon from "./AggregationIcon";
import { useLocation, useNavigate } from "@reach/router";

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:last-child th, &:last-child td": {
      borderBottom: 0,
    },
  },
}))(TableRow);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  table: {
    minWidth: 750,
  },
  ["PrivateSwitchBase-root-4"]: {
    padding: "3px",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

const StyledCheckbox = (props) => {
  return (
    <Checkbox
      style={{
        padding: "2px",
        color: props.color,
      }}
      icon={<CheckBoxOutlineBlankIcon style={{ fontSize: "small" }} />}
      checkedIcon={<CheckBoxIcon style={{ fontSize: "small" }} />}
      {...props}
    />
  );
};

const SortableCell = ({
  name,
  classes,
  sortBy,
  sortOrder,
  sortDirection,
  handleTableSort,
  excludeDirect,
  excludeAncestral,
  excludeDescendant,
}) => {
  return (
    <TableCell
      key={name}
      style={{
        whiteSpace: "normal",
        wordWrap: "break-word",
        maxWidth: "8rem",
        verticalAlign: "bottom",
      }}
      sortDirection={sortDirection}
    >
      <Tooltip key={name} title={`Sort by ${name.replaceAll("_", " ")}`} arrow>
        <TableSortLabel
          active={sortBy === name}
          direction={sortOrder}
          onClick={() =>
            handleTableSort({
              sortBy: name,
              sortOrder: sortDirection && sortOrder === "asc" ? "desc" : "asc",
            })
          }
        >
          {name.replaceAll("_", " ")}
          {sortBy === name ? (
            <span className={classes.visuallyHidden}>
              {sortOrder === "desc" ? "sorted descending" : "sorted ascending"}
            </span>
          ) : null}
        </TableSortLabel>
      </Tooltip>
      <br />
      {excludeAncestral && (
        <span className={styles.aggregationToggle}>
          <Tooltip
            key={"direct"}
            title={"Toggle directly measured values"}
            arrow
          >
            <StyledCheckbox
              checked={!excludeDirect.hasOwnProperty(name)}
              onChange={() => handleTableSort({ toggleDirect: name })}
              color={"green"}
              inputProps={{ "aria-label": "direct checkbox" }}
            />
          </Tooltip>
          <Tooltip
            key={"direct"}
            title={"Toggle values inferred from descendant taxa"}
            arrow
          >
            <StyledCheckbox
              checked={!excludeDescendant.hasOwnProperty(name)}
              onChange={() => handleTableSort({ toggleDescendant: name })}
              color={"orange"}
              inputProps={{ "aria-label": "descendant checkbox" }}
            />
          </Tooltip>
          <Tooltip
            key={"direct"}
            title={"Toggle values inferred from ancestral taxa"}
            arrow
          >
            <StyledCheckbox
              checked={!excludeAncestral.hasOwnProperty(name)}
              onChange={() => handleTableSort({ toggleAncestral: name })}
              color={"red"}
              inputProps={{ "aria-label": "ancestral checkbox" }}
            />
          </Tooltip>
        </span>
      )}
    </TableCell>
  );
};

const DownloadButton = ({ onButtonClick, searchTerm }) => {
  const options = {
    "Save CSV": { format: "csv" },
    "Save TSV": { format: "tsv" },
    "Save JSON": { format: "json" },
    "Save Tidy Data": { format: "tsv", tidyData: true },
    "Save Raw Values": {
      format: "tsv",
      tidyData: true,
      includeRawValues: true,
    },
  };

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleClick = () => {
    let key = Object.keys(options)[selectedIndex];
    let format = options[key].format;
    let fullOptions = {
      ...searchTerm,
      ...options[key],
      offset: 0,
      size: 10000,
    };
    delete fullOptions.format;
    onButtonClick(fullOptions, format);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <span
      style={{
        margin: "1em 0",
        float: "right",
        maxHeight: "2em",
        overflow: "visible",
        backgroundColor: "white",
      }}
    >
      <ButtonGroup
        variant="contained"
        color="primary"
        ref={anchorRef}
        aria-label="split button"
      >
        <Button onClick={handleClick}>
          {Object.keys(options)[selectedIndex]}
        </Button>
        <Button
          color="primary"
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      {/* <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        disablePortal
      > */}
      <Paper style={{ height: open ? "auto" : 0, overflow: "hidden" }}>
        <ClickAwayListener onClickAway={handleClose}>
          <MenuList id="split-button-menu">
            {Object.keys(options).map((option, index) => (
              <MenuItem
                key={option}
                selected={index === selectedIndex}
                onClick={(event) => handleMenuItemClick(event, index)}
              >
                {option}
              </MenuItem>
            ))}
          </MenuList>
        </ClickAwayListener>
      </Paper>
      {/* </Popper> */}
    </span>
  );
};
const ResultTable = ({
  displayTypes,
  fetchSearchResults,
  saveSearchResults,
  searchResults,
  searchTerm,
}) => {
  const navigate = useNavigate();
  const classes = useStyles();
  let sortBy = searchTerm.sortBy || "";
  let sortOrder = searchTerm.sortOrder || "asc";
  // console.log(searchTerm);
  const handleTaxonClick = (taxon_id) => {
    // setRecordId(taxon_id);
    navigate(`records?taxon_id=${taxon_id}`);
  };
  // const [excludeAncestral, setExcludeAncestral] = useState({});
  // const [excludeDescendant, setExcludeDescendant] = useState({});
  // const [excludeDirect, setExcludeDirect] = useState({});

  // const setExclusion = (excludeSource) => {
  //   if (excludeSource) {
  //     let [key, value] = Object.entries(excludeSource)[0];
  //     let current = searchTerm[key] || [];
  //   }
  // };
  const arrToObj = (arr) => {
    let obj = {};
    if (arr) {
      arr.forEach((key) => {
        obj[key] = true;
      });
    }
    return obj;
  };
  const handleTableSort = ({
    sortBy,
    sortOrder,
    toggleAncestral,
    toggleDescendant,
    toggleDirect,
  }) => {
    if (sortBy && sortBy != "") {
      searchTerm.sortBy = sortBy;
      searchTerm.sortOrder = sortOrder;
    } else if (sortBy) {
      delete searchTerm.sortBy;
      delete searchTerm.sortOrder;
    }
    let ancestral = arrToObj(searchTerm.excludeAncestral);
    if (toggleAncestral) {
      ancestral[toggleAncestral] = !ancestral[toggleAncestral];
    }
    searchTerm.excludeAncestral = [];
    Object.keys(ancestral).forEach((key) => {
      if (ancestral[key]) {
        searchTerm.excludeAncestral.push(key);
      }
    });
    let descendant = arrToObj(searchTerm.excludeDescendant);
    if (toggleDescendant) {
      descendant[toggleDescendant] = !descendant[toggleDescendant];
    }
    searchTerm.excludeDescendant = [];
    Object.keys(descendant).forEach((key) => {
      if (descendant[key]) {
        searchTerm.excludeDescendant.push(key);
      }
    });
    let direct = arrToObj(searchTerm.excludeDirect);
    if (toggleDirect) {
      direct[toggleDirect] = !direct[toggleDirect];
    }
    searchTerm.excludeDirect = [];
    Object.keys(direct).forEach((key) => {
      if (direct[key]) {
        searchTerm.excludeDirect.push(key);
      }
    });
    fetchSearchResults(searchTerm);
  };
  let rows = searchResults.results.map((result) => {
    let name = result.result.scientific_name;
    if (
      result.result.taxon_rank == "species" ||
      result.result.taxon_rank == "subspecies"
    ) {
      name = <em>{name}</em>;
    }
    let cells = [
      <Tooltip title={"Click to view record"} arrow>
        <TableCell
          key={"name"}
          style={{ cursor: "pointer" }}
          onClick={() => handleTaxonClick(result.result.taxon_id)}
        >
          {name}
        </TableCell>
      </Tooltip>,
      <Tooltip title={"Click to view record"} arrow>
        <TableCell
          key={"taxon_id"}
          style={{ cursor: "pointer" }}
          onClick={() => handleTaxonClick(result.result.taxon_id)}
        >
          {result.result.taxon_id}
        </TableCell>
      </Tooltip>,
    ];
    displayTypes.forEach((type) => {
      if (result.result.fields.hasOwnProperty(type.name)) {
        let field = result.result.fields[type.name];
        let value = field.value;
        if (Array.isArray(value)) {
          value = value[0];
        }
        value = isNaN(value) ? value : formatter(value);
        if (Array.isArray(field.value) && field.count > 1) {
          value = `${value} ...`;
        }
        cells.push(
          <TableCell key={type.name}>
            <div className={styles.fieldValue}>
              {value}
              <AggregationIcon method={field.aggregation_source} />
            </div>
          </TableCell>
        );
      } else {
        cells.push(<TableCell key={type.name}>-</TableCell>);
      }
    });
    cells.push(
      <Tooltip title={"Click to view record"} arrow>
        <TableCell key={"go to record"}>
          <IconButton
            aria-label="go to record"
            size="small"
            onClick={() => handleTaxonClick(result.result.taxon_id)}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </TableCell>
      </Tooltip>
    );
    return <StyledTableRow key={result.id}>{cells}</StyledTableRow>;
  });
  let heads = [
    <SortableCell
      name={"scientific_name"}
      classes={classes}
      sortBy={sortBy}
      sortOrder={sortOrder}
      sortDirection={sortBy === "scientific_name" ? sortOrder : false}
      handleTableSort={handleTableSort}
    />,
    <SortableCell
      name={"taxon_id"}
      classes={classes}
      sortBy={sortBy}
      sortOrder={sortOrder}
      sortDirection={sortBy === "taxon_id" ? sortOrder : false}
      handleTableSort={handleTableSort}
    />,
  ];
  displayTypes.forEach((type) => {
    let sortDirection = sortBy === type.name ? sortOrder : false;
    heads.push(
      <SortableCell
        name={type.name}
        classes={classes}
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortDirection={sortDirection}
        handleTableSort={handleTableSort}
        excludeAncestral={arrToObj(searchTerm.excludeAncestral)}
        excludeDescendant={arrToObj(searchTerm.excludeDescendant)}
        excludeDirect={arrToObj(searchTerm.excludeDirect)}
      />
    );
  });
  heads.push(<TableCell key={"last"}></TableCell>);

  return (
    <span className={styles.disableTheme}>
      <Box margin={1}>
        <Table size="small" aria-label="search results">
          <TableHead>
            <TableRow>{heads}</TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
        {/* <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={values.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        /> */}
      </Box>
      {/* <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.button}
        onClick={() => saveSearchResults(searchTerm, "csv")}
        startIcon={<SaveIcon />}
      >
        Save
      </Button> */}
      <DownloadButton
        onButtonClick={saveSearchResults}
        searchTerm={searchTerm}
      />
    </span>
  );
};

export default compose(withTypes, withSearch)(ResultTable);
