import {h, mini} from "./mini/mini.js";

const content = document.getElementById("content");

// only temporarily
let nextDevId = 0;
let nextProId = 0;

function allowDrop(evt) {
    evt.target.classList.add("drop");
    evt.preventDefault(); // default is not to allow drags.
}

const drop = action => evt => {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("text");
    evt.target.classList.remove("drop");
    action(data, evt.target.id);
};

const initialState = {
    beginDate: new Date(),
    endDate:   new Date(),
    developers: [ {id:nextDevId++} ],
    projects:   [ {id:nextProId++} ],
    status:     ""
};

const side = effect => state => { effect(state); return state;};

const actions = {
    addDev:           side(state => state.developers.push( {id:nextDevId++})),
    addPro:           side(state => state.projects.push(   {id:nextProId++})),
    removeDev: id  => side(state => state.developers = state.developers.filter(dev => dev.id !== id) ),
    removePro: id  => side(state => state.projects   = state.projects.  filter(pro => pro.id !== id) ),
    status:    msg => side(state => state.status = msg),
};


const view = (act, state) =>
    h("main", {}, [
        h("div", { id: "beginDate" }, "Begin Date: " + state.beginDate.toLocaleDateString()),
        h("div", { id: "endDate"   }, "End Date: "   + state.endDate.toLocaleDateString()),

        h("div", {id: "developers"}, [
            h("button", { click: act(actions.addDev) }, "+"),
            ...state.developers.map( dev => h("div", {
              class:     "developer",
              id:        dev.id,
              draggable: true,
              dragstart: evt => evt.dataTransfer.setData("text", evt.target.id)
            }, [
                h("button", { click: act(actions.removeDev(dev.id)) }, "-"),
                " Developer " + dev.id
            ]))
          ]
        ),

        h("div", {id: "projects"},[
          h("button", { click: act(actions.addPro) }, "+"),
          ...state.projects.map( project => h("div", {
              class:     "project",
              id:        project.id,
              drop:      drop( (from, to) =>
                             act( actions.status(`dropped developer ${from} onto project ${to}`) ) ()
                         ),
              dragover:  allowDrop,
              dragleave: evt => evt.target.classList.remove("drop")
            }, [
                h("button", { click: act(actions.removePro(project.id)) }, "-"),
                " Project " + project.id
            ]))
          ]
        ),

        h("div",{id:"status"}, state.status),
    ]);

mini(view, initialState, content);