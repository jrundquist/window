import * as React from "react";
import { init } from "./add.cpp";
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import {View} from './view';
const theme = createMuiTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: green[500],
    },
  },
});

const useStyles = makeStyles({
  root: {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface Props {}

export const App: React.FunctionComponent<Props> = ({ }) => {

  const classes = useStyles();

  const [additionResult, setAdditionResult] = React.useState<number>(0);
  React.useEffect(() => {
    init<AddModule>().then((module) => {
      (window as any)['module'] = module;
      setAdditionResult(module.exports.add(1, 20))
    });
  }, [setAdditionResult]);

  const getStarted = React.useCallback(() => {

  }, []);

  return (
    <ThemeProvider theme={theme}>
    <div className={classes.root}>
      <View />
    </div>
    </ThemeProvider>
  );
};
