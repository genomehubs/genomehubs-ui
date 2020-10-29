import React from "react";
import { withStyles } from "@material-ui/core/styles";
import GetAppIcon from "@material-ui/icons/GetApp";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

const ColorButtonGroup = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText("#333333"),
    backgroundColor: "#333333",
    "&:hover": {
      backgroundColor: "#999999",
    },
  },
}))(ButtonGroup);

const DownloadButton = ({ onButtonClick, searchTerm }) => {
  const options = {
    CSV: { format: "csv" },
    TSV: { format: "tsv" },
    JSON: { format: "json" },
    "Tidy Data": { format: "tsv", tidyData: true },
    "Raw Values": {
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
        margin: "1em 0 1em auto",
        maxHeight: "2em",
        overflow: "visible",
        backgroundColor: "white",
        flex: "0 1 auto",
      }}
    >
      <ColorButtonGroup
        variant="contained"
        disableElevation
        // color="primary"
        ref={anchorRef}
        aria-label="split button"
      >
        <Button startIcon={<GetAppIcon />} onClick={handleClick}>
          {Object.keys(options)[selectedIndex]}
        </Button>
        <Button
          // color="primary"
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ColorButtonGroup>

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
    </span>
  );
};

export default DownloadButton;
