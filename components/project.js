import {h}                              from "../mini/mini.js";
import {progressStyle,allowDrop, drop}  from "./helper.js";
import {create}                         from "../services/projectService.js";

export {view , addPro}

const actions = {
    setName:      proj => (state, event) => { proj.name      = event.target.value;},
    setNeedsFTE:  proj => (state, event) => { proj.needsFTE  = Number(event.target.value);},

    addPro:           state => { state.projects.push(  create({name:"change"})) },
    removePro:    id   => state          => { state.projects = state.projects.filter(pro => pro.id !== id)  },

    setAssignedPCT: assignment => (state, event) => {assignment.assignedPCT = Number(event.target.value);},
    assign: (devId, project) => state => {
        project.assigned.push( {devId:devId, assignedPCT:100} ); // todo: set workPCT - load
        state.status = 'Assigned developer to project.'
    },
    deleteAssignment: (project, assignment) => _ => {
      project.assigned = project.assigned.filter( it => it !== assignment)
    },
};

const addPro = actions.addPro;


const getDevById = (devId, state) => state.developers.find( dev => dev.id === devId );

const getFTEs = project =>
    project.assigned.reduce( (sum, assignment) => sum + assignment.assignedPCT / 100 ,0);

const view = project => (act, state) =>
    h("div", {
      class:     "project",
      id:        project.id,
      drop:      drop( (devId, to) => {
                    if (null == devId || '' === devId) {
                        act( state => state.status(`Drag and drop did not work. Please try again.`) ) ();
                        return;
                    }
                    act( actions.assign(Number(devId), project)) ();
                  }),
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
            style: progressStyle(getFTEs(project) * 100 / project.needsFTE ),
        }, getFTEs(project) ),
        h("div", { class: "assignments"},
            project.assigned.map( assignment =>
              h("div", {}, [
                 h("button", {
                     class: "delete",
                     click: act(actions.deleteAssignment(project, assignment))
                 }, "x"),
                 h("input", {
                     type: "text", size:3,
                     value: assignment.assignedPCT,
                     change: act(actions.setAssignedPCT(assignment))}),
                 h("span", {}, "" + getDevById(assignment.devId, state).firstname ),
                 h("span", {}, "" + getDevById(assignment.devId, state).lastname ),
              ])
            )
        ),
    ]);