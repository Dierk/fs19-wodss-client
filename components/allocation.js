import {h, mini}                        from "../mini/mini.js";
import {view as dateView}               from "./datePicker.js";
import {view as devView, addDev}        from "./developer.js";
import {progressStyle, drop, allowDrop} from "./helper.js"

const content = document.getElementById("content");

// only temporarily
let nextProId = 0;

const initialState = {
    beginDate: new Date(),
    endDate:   new Date(),
    developers: [ ],
    projects:   [ {id:nextProId++, name:"Staffing", needsFTE: 3 , assigned: [] } ],
    status:     ""
};

const actions = {
    addPro:           state => { state.projects.push(   {id:nextProId++, name:"change", needsFTE: 1, assigned:[] }) },
    removePro:    id   => state          => { state.projects = state.projects.filter(pro => pro.id !== id)  },
    status:       msg  => state          => { state.status   = msg },
    setName:      proj => (state, event) => { proj.name      = event.target.value;},
    setNeedsFTE:  proj => (state, event) => { proj.needsFTE  = Number(event.target.value);},
    setAssignedPCT: assignment => (state, event) => {assignment.assignedPCT = Number(event.target.value);},
    assign: (devId, project) => _ => {
        project.assigned.push( {devId:devId, assignedPCT:100} ); // todo: set workPCT - load
    },
    deleteAssignment: (project, assignment) => _ => {
      project.assigned = project.assigned.filter( it => it !== assignment)
    }
};


const getDevById = (devId, state) => state.developers.find( dev => dev.id === devId );

const getFTEs = project =>
    project.assigned.reduce( (sum, assignment) => sum + assignment.assignedPCT / 100 ,0);


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
          h("button", { click: act(actions.addPro) }, "+"),
          ...state.projects.map( project => h("div", {
              class:     "project",
              id:        project.id,
              drop:      drop( (devId, to) => {
                            if (null == devId || '' === devId) {
                                act( actions.status(`Drag and drop did not work. Please try again.`) ) ();
                                return;
                            }
                            act( actions.assign(Number(devId), project)) ();
                            act( actions.status(`Assigned developer to project.`) ) ();
                            }
                         ),
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
            ]))
          ]
        ),

        h("div",{id:"status"}, state.status),
    ]);

mini(view, initialState, content, state => state.status = "");