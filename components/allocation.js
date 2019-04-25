import {h, mini}                        from "../mini/mini.js";
import {view as dateView}               from "./datePicker.js";
import {view as devView, addDev}        from "./developer.js";
import {view as proView, addPro}        from "./project.js";

const content = document.getElementById("content");

/**
 * Global State
 * @type {{beginDate: Date, projects: Array, endDate: Date, developers: Array, status: string}}
 */
const state = {
    beginDate:  new Date(),
    endDate:    new Date(),
    developers: [ ],
    projects:   [ ],
    status:     ""
};

const actions = {
    // intentionally left blank. All actions are local to the component that triggers it or exported otherwise
};

const view = (act, state) =>
    h("main", {}, [
        dateView('Begin', 'beginDate')(act, state),
        dateView('End',   'endDate')  (act, state),

        h("div", {id: "developers"}, [
            h("button", { click: act(addDev(act)) }, "+"),
            ...state.developers.map( dev => devView(dev)(act,state) )
          ]
        ),

        h("div", {id: "projects"},[
          h("button", { click: act(addPro) }, "+"),
          ...state.projects.map( project => proView(project)(act,state) )
          ]
        ),

        h("div",{id:"status"}, state.status),
    ]);

mini(view, state, content, state => state.status = "");