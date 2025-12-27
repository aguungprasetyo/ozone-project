#!/usr/bin/env node
import { render } from "ink";
import { createElement } from "react";
import App from "../dist/cli.js";

render(createElement(App));
