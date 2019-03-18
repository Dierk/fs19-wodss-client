import {h} from "./mini/mini.js";

export { view }

const view = (label, id) => (act, state) =>
    h("div", { id: id }, label + " Date: " + state[id].toLocaleDateString());

