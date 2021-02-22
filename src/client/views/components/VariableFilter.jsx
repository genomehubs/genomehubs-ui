import AutorenewIcon from "@material-ui/icons/Autorenew";
import BasicSelect from "./BasicSelect";
import BasicTextField from "./BasicTextField";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import React from "react";
import Typography from "@material-ui/core/Typography";
import { useStyles } from "./SearchOptions";

const VariableFilter = ({
  field,
  operator = "",
  value = "",
  bool,
  label,
  fields,
  handleVariableChange,
  handleOperatorChange,
  handleValueChange,
  handleUpdate,
  handleDismiss,
}) => {
  const classes = useStyles();
  const allowedOperators = {
    "": "",
    ">": ">",
    ">=": ">=",
    "<": "<",
    "<=": "<=",
    "=": "=",
    "==": "==",
    contains: "contains",
  };
  return (
    <Grid container alignItems="center" direction="row" spacing={2}>
      {bool && (
        <Grid item>
          <Typography>{bool}</Typography>
        </Grid>
      )}
      <Grid item>
        <BasicSelect
          current={field}
          id={`variable-${field}-select`}
          handleChange={handleVariableChange}
          helperText={"field"}
          values={fields}
        />
      </Grid>
      <Grid item>
        <BasicSelect
          current={operator}
          id={`variable-${field}-operator-select`}
          handleChange={handleOperatorChange}
          helperText={"operator"}
          values={allowedOperators}
        />
      </Grid>
      <Grid item>
        <BasicTextField
          id={`variable-${field}-value-input`}
          handleChange={handleValueChange}
          helperText={"value"}
          value={value}
        />
      </Grid>
      {handleDismiss && (
        <Grid item style={{ marginLeft: "auto" }}>
          <IconButton
            aria-label="remove filter"
            size="inherit"
            onClick={handleDismiss}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      )}
      {handleUpdate && (
        <Grid item>
          <Button
            variant="contained"
            color="default"
            startIcon={<AutorenewIcon />}
            onClick={handleUpdate}
            disableElevation
          >
            Update
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default VariableFilter;
