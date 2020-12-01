import React, { useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useLocation, useNavigate } from "@reach/router";

import AggregationIcon from "./AggregationIcon";
import Box from "@material-ui/core/TableContainer";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import Checkbox from "@material-ui/core/Checkbox";
import DownloadButton from "./DownloadButton";
import Grid from "@material-ui/core/Grid";
import Grow from "@material-ui/core/Grow";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import Popper from "@material-ui/core/Popper";
import SearchPagination from "./SearchPagination";
import Skeleton from "@material-ui/lab/Skeleton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Tooltip from "@material-ui/core/Tooltip";
import classnames from "classnames";
import { compose } from "recompose";
import { formatter } from "../functions/formatter";
import { setPreferSearchTerm } from "../reducers/search";
import styles from "./Styles.scss";
import withSearch from "../hocs/withSearch";
import withTypes from "../hocs/withTypes";

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // "&:last-child th, &:last-child td": {
    //   borderBottom: 0,
    // },
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
        padding: "1px",
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
  showExcludeBoxes,
  excludeDirect,
  excludeAncestral,
  excludeDescendant,
  excludeMissing,
}) => {
  let css = styles.aggregationToggle;
  if (excludeAncestral) {
    if (
      excludeDirect.hasOwnProperty(name) ||
      excludeDescendant.hasOwnProperty(name) ||
      excludeAncestral.hasOwnProperty(name) ||
      excludeMissing.hasOwnProperty(name)
    ) {
      css = classnames(
        styles.aggregationToggle,
        styles.aggregationToggleOpaque
      );
    }
  }

  return (
    <TableCell
      key={name}
      style={{
        whiteSpace: "normal",
        wordWrap: "break-word",
        maxWidth: "8rem",
        minWidth: "3rem",
        lineHeight: "1rem",
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
      {(showExcludeBoxes && (
        <span className={css}>
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
            key={"descendant"}
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
            key={"ancestral"}
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
          <Tooltip key={"missing"} title={"Toggle missing values"} arrow>
            <StyledCheckbox
              checked={!excludeMissing.hasOwnProperty(name)}
              onChange={() => handleTableSort({ toggleMissing: name })}
              color={"black"}
              inputProps={{ "aria-label": "missing checkbox" }}
            />
          </Tooltip>
        </span>
      )) || <span className={css}></span>}
    </TableCell>
  );
};

const ResultTable = ({
  displayTypes,
  fetchSearchResults,
  saveSearchResults,
  searchResults,
  searchTerm,
  setSearchTerm,
  searchIndex,
  setPreferSearchTerm,
}) => {
  if (!searchResults.status || !searchResults.status.hasOwnProperty("hits")) {
    return null;
  }
  const navigate = useNavigate();
  const classes = useStyles();
  let sortBy = searchTerm.sortBy || "";
  let sortOrder = searchTerm.sortOrder || "asc";
  const handleTaxonClick = (taxon_id, scientific_name) => {
    setPreferSearchTerm(false);
    navigate(
      `records?taxon_id=${taxon_id}&result=${searchIndex}#${encodeURIComponent(
        scientific_name
      )}`
    );
  };
  const arrToObj = (arr) => {
    let obj = {};
    if (arr) {
      arr.forEach((key) => {
        obj[key] = true;
      });
    }
    return obj;
  };
  const location = useLocation();
  const handleTableSort = ({
    sortBy,
    sortOrder,
    toggleAncestral,
    toggleDescendant,
    toggleDirect,
    toggleMissing,
  }) => {
    let options = { ...searchTerm };
    if (sortBy && sortBy != "") {
      options.sortBy = sortBy;
      options.sortOrder = sortOrder;
    } else if (sortBy) {
      delete options.sortBy;
      delete options.sortOrder;
    }
    let ancestral = arrToObj(options.excludeAncestral);
    if (toggleAncestral) {
      ancestral[toggleAncestral] = !ancestral[toggleAncestral];
    }
    options.excludeAncestral = [];
    Object.keys(ancestral).forEach((key) => {
      if (ancestral[key]) {
        options.excludeAncestral.push(key);
      }
    });
    let descendant = arrToObj(options.excludeDescendant);
    if (toggleDescendant) {
      descendant[toggleDescendant] = !descendant[toggleDescendant];
    }
    options.excludeDescendant = [];
    Object.keys(descendant).forEach((key) => {
      if (descendant[key]) {
        options.excludeDescendant.push(key);
      }
    });
    let direct = arrToObj(options.excludeDirect);
    if (toggleDirect) {
      direct[toggleDirect] = !direct[toggleDirect];
    }
    options.excludeDirect = [];
    Object.keys(direct).forEach((key) => {
      if (direct[key]) {
        options.excludeDirect.push(key);
      }
    });
    let missing = arrToObj(options.excludeMissing);
    if (toggleMissing) {
      missing[toggleMissing] = !missing[toggleMissing];
    }
    options.excludeMissing = [];
    Object.keys(missing).forEach((key) => {
      if (missing[key]) {
        options.excludeMissing.push(key);
      }
    });
    if (location.search.match(/tax_tree%28/)) {
      options.query = options.query.replace("tax_name", "tax_tree");
    }
    options.offset = 0;
    setPreferSearchTerm(true);
    setSearchTerm(options);
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
          onClick={() =>
            handleTaxonClick(
              result.result.taxon_id,
              result.result.scientific_name
            )
          }
        >
          {name}
        </TableCell>
      </Tooltip>,
      <Tooltip title={"Click to view record"} arrow>
        <TableCell
          key={"taxon_id"}
          style={{ cursor: "pointer" }}
          onClick={() =>
            handleTaxonClick(
              result.result.taxon_id,
              result.result.scientific_name
            )
          }
        >
          {result.result.taxon_id}
        </TableCell>
      </Tooltip>,
    ];
    displayTypes.forEach((type) => {
      if (type.name != "sex_determination_system") {
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
      }
    });
    cells.push(
      <Tooltip title={"Click to view record"} arrow>
        <TableCell key={"go to record"}>
          <IconButton
            aria-label="go to record"
            size="small"
            onClick={() =>
              handleTaxonClick(
                result.result.taxon_id,
                result.result.scientific_name
              )
            }
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
    if (type.name != "sex_determination_system") {
      let sortDirection = sortBy === type.name ? sortOrder : false;
      heads.push(
        <SortableCell
          name={type.name}
          classes={classes}
          sortBy={sortBy}
          sortOrder={sortOrder}
          sortDirection={sortDirection}
          handleTableSort={handleTableSort}
          showExcludeBoxes={true}
          excludeAncestral={arrToObj(searchTerm.excludeAncestral)}
          excludeDescendant={arrToObj(searchTerm.excludeDescendant)}
          excludeDirect={arrToObj(searchTerm.excludeDirect)}
          excludeMissing={arrToObj(searchTerm.excludeMissing)}
        />
      );
    }
  });
  heads.push(<TableCell key={"last"}></TableCell>);

  return (
    <span>
      <Box margin={1}>
        {/* {searchResults.isFetching ? (
          <Skeleton variant="rect" width={800} height={200} />
        ) : ( */}
        <TableContainer className={classes.container}>
          <Table size="small" aria-label="search results">
            <TableHead>
              <TableRow>{heads}</TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
        {/* )} */}
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "flex-start",
          position: "relative",
          overflow: "visible",
        }}
      >
        <DownloadButton
          onButtonClick={saveSearchResults}
          searchTerm={searchTerm}
        />
        <SearchPagination />
      </Box>
    </span>
  );
};

export default compose(withTypes, withSearch)(ResultTable);
