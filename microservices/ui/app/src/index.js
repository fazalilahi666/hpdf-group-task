import React from 'react';
import ReactDOM from 'react-dom';
import MainApp from './MainApp';
import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const App = () => (
    <MuiThemeProvider>
        <MainApp/>
    </MuiThemeProvider>
);
ReactDOM.render(<App />, document.getElementById('root'));