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
    developers: [ {id:nextDevId++, firstname: "Claudia", lastname:"Muster", workPCT: 100} ],
    projects:   [ {id:nextProId++, name:"Staffing", needsFTE: 3 , assigned: [] } ],
    status:     ""
};

const actions = {
    addDev:           state => { state.developers.push( {id:nextDevId++, firstname: "change", lastname:"change", workPCT: 100}) },
    addPro:           state => { state.projects.push(   {id:nextProId++, name:"change", needsFTE: 1, assigned:[] }) },
    removeDev: id  => state => {
        const used = state.projects.some( proj => proj.assigned.some( assignment => assignment.devId === id));
        if (used) {
            state.status = "Cannot delete developer since there are still assignments."
        } else {
            state.developers = state.developers.filter(dev => dev.id !== id);
        }
    },
    removePro:    id   => state          => { state.projects = state.projects.filter(pro => pro.id !== id)  },
    status:       msg  => state          => { state.status   = msg },
    setFirstname: dev  => (state, event) => { dev.firstname  = event.target.value;},
    setLastname:  dev  => (state, event) => { dev.lastname   = event.target.value;},
    setWorkPCT:   dev  => (state, event) => { dev.workPCT    = Number(event.target.value);},
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

const getLoad = (devId, state) =>
    state.projects.reduce( (sum,proj) =>
       sum + proj.assigned
               .filter(assignment => assignment.devId === devId)
               .map(assignment => assignment.assignedPCT)
               .reduce( (accu, cur)=> accu + cur, 0) ,0) ;

const getDevById = (devId, state) => state.developers.find( dev => dev.id === devId );

const getFTEs = project =>
    project.assigned.reduce( (sum, assignment) => sum + assignment.assignedPCT / 100 ,0);

const progressStyle = pct => {
    const red   = "rgba(255,0,0, 0.7)";
    const green = "rgba(115,153,150,0.7)";
    return `background: linear-gradient(90deg, ${red}, ${red} ${pct}%, ${green} ${pct}%, ${green} );`
};

const view = (act, state) =>
    h("main", {}, [
        dateView('Begin', 'beginDate')(act, state),
        dateView('End',   'endDate')  (act, state),

        h("div", {id: "developers"}, [
            h("button", { click: act(actions.addDev) }, "+"),
            ...state.developers.map( dev => h("div", {
              class:     "developer",
              id:        dev.id, // for DnD
              draggable: true,
              dragstart: evt => evt.dataTransfer.setData("text", evt.target.id)
            }, [
                h("button", { click: act(actions.removeDev(dev.id)) }, "-"),
                h("div", {}, [
                    h("label", {}, "First Name: "),
                    h("input", {
                        type:   "text",
                        value:  dev.firstname,
                        change: act(actions.setFirstname(dev))}),
                    h("label", {}, "Last Name: "),
                    h("input", {
                        type:   "text",
                        value:  dev.lastname,
                        change: act(actions.setLastname(dev))}),
                    h("label", {}, "Works %: "),
                    h("input", {
                        type:   "text", maxlength:"3",
                        value:  dev.workPCT,
                        change: act(actions.setWorkPCT(dev))}),
                    h("label", {}, "Load:"),
                    h("div", {
                        class: "load",
                        style: progressStyle(getLoad(dev.id, state)),
                    }, getLoad(dev.id, state) + " %")
                ]),
                h("img",{src:"/img/img"+ (dev.id % 8) + ".jpg"})
            ]))
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