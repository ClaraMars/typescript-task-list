const app = require("./App")
//import { App } from "./App";

window.addEventListener('load', async() => {
    const app = new App();
    app.init();
});