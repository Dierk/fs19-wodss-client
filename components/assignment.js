import {h}                              from "../mini/mini.js";

export {view , assign}

const actions = {
    setAssignedPCT: assignment => (state, event) => {assignment.assignedPCT = Number(event.target.value);},

    assign: (devId, project) => state => {
        project.assigned.push( {devId:devId, assignedPCT: getDevById(devId, state).workPCT} );
        state.status = 'Assigned developer to project.'
    },
    deleteAssignment: (project, assignment) => _ => {
      project.assigned = project.assigned.filter( it => it !== assignment)
    },
};

const assign = actions.assign;

const getDevById = (devId, state) => state.developers.find( dev => dev.id === devId );

const view = (project, assignment) => (act, state) =>
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
      ]);