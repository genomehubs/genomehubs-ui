import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
}));
const BasicTextField = ({ id, handleChange, label, helperText, value }) => {
  const classes = useStyles;
  return (
    <FormControl className={classes.formControl}>
      <TextField id={id} label={label} value={value} onChange={handleChange} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default BasicTextField;
