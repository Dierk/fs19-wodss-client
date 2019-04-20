import {h, mini}          from "../mini/mini.js";
import {view as dateView} from "./datePicker.js"

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
    developers: [ {id:nextDevId++, firstname: "George", lastname:"Clooney", workPCT: 100} ],
    projects:   [ {id:nextProId++, name:"", needsFTE: 1 } ],
    status:     ""
};

const actions = {
    addDev:           state => { state.developers.push( {id:nextDevId++}) },
    addPro:           state => { state.projects.push(   {id:nextProId++}) },
    removeDev: id  => state => { state.developers = state.developers.filter(dev => dev.id !== id)  },
    removePro: id  => state => { state.projects   = state.projects.  filter(pro => pro.id !== id)  },
    status:    msg => state => { state.status = msg },
    setFirstname: devId => (state, event) => {
        state.developers.find(it=> it.id === devId).firstname = event.target.value;
    },
    setLastname: devId => (state, event) => {
        state.developers.find(it=> it.id === devId).lastname = event.target.value;
    },
    setWorkPCT: devId => (state, event) => {
        state.developers.find(it=> it.id === devId).workPCT = event.target.value;
    }
};

const view = (act, state) =>
    h("main", {}, [
        dateView('Begin', 'beginDate')(act, state),
        dateView('End',   'endDate')  (act, state),

        h("div", {id: "developers"}, [
            h("button", { click: act(actions.addDev) }, "+"),
            ...state.developers.map( dev => h("div", {
              class:     "developer",
              id:        dev.id,
              draggable: true,
              dragstart: evt => evt.dataTransfer.setData("text", evt.target.id)
            }, [
                h("button", { click: act(actions.removeDev(dev.id)) }, "-"),
                h("div", {}, [
                    h("label", {for:`dev${dev.id}-fn`}, "First Name: "),
                    h("input", {
                        id: `dev${dev.id}-fn`,
                        type: "text",
                        value: dev.firstname,
                        change: act(actions.setFirstname(dev.id))}),
                    h("label", {for:`dev${dev.id}-ln`}, "Last Name: "),
                    h("input", {
                        id: `dev${dev.id}-ln`,
                        type: "text",
                        value: dev.lastname,
                        change: act(actions.setLastname(dev.id))}),
                    h("label", {for:`dev${dev.id}-cap`}, "Works %: "),
                    h("input", {
                        id: `dev${dev.id}-cap`,
                        type: "number",
                        value: dev.workPCT,
                        change: act(actions.setWorkPCT(dev.id))}),
                ])
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