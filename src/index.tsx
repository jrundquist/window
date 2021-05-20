import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./App";
import "./style.css";

const rootNode = document.getElementById("root");
console.log('foo');
ReactDOM.render(<App />, rootNode);