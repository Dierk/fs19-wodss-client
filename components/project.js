import {h}                              from "../mini/mini.js";
import {progressStyle,allowDrop, drop}  from "./helper.js";
import {create}                         from "../services/projectService.js";
import {view as assignView, assign}     from "./assignment.js"

export {view , addPro}

const actions = {
    setName:      proj => (state, event) => { proj.name      = event.target.value;},
    setNeedsFTE:  proj => (state, event) => { proj.needsFTE  = Number(event.target.value);},

    addPro:                state =>         { state.projects.push(  create({name:"change"})) },
    removePro:    id    => state =>         { state.projects = state.projects.filter(pro => pro.id !== id)  },
};

const addPro = actions.addPro;

const getFTEs = project =>
    project.assigned.reduce( (sum, assignment) => sum + assignment.assignedPCT / 100 ,0);

const onDrop = (project, act) => drop( (devId, to) =>
    (null == devId || '' === devId)
    ? act(state => state.status(`Drag and drop did not work. Please try again.`) ) ()
    : act(assign(Number(devId), project)) ()
);

const view = project => (act, state) =>
    h("div", {
      class:     "project" + (project.needsFTE < getFTEs(project) ? " attention" : ""),
      id:        project.id,
      drop:      onDrop(project, act), // asynchronous
      dragover:  allowDrop,
      dragleave: evt => evt.target.classList.remove("drop")
    }, [
        h("button", { click: act(actions.removePro(project.id)) }, "-"),
        h("input", {
            type: "text",
            value: project.name,
            change: act(actions.setName(project))}),
        h("span", {}, "needs FTE"),
        h("input", {
            type: "text", size:4,
            value: project.needsFTE,
            change: act(actions.setNeedsFTE(project))}),
        h("span", {}, "has"),
        h("div", {
            class: "load",
            style: progressStyle(getFTEs(project) * 100 / project.needsFTE, false ),
        }, getFTEs(project) ),
        h("div", { class: "assignments"},
            project.assigned.map( assignment => assignView(project, assignment)(act, state) )
        ),
    ]);