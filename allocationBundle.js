function h(name, attributes, node) {
    const children =
        node instanceof Array
        ? node
        : node != null ? [node] : [];
    return {
        name:       name,
        attributes: attributes || {},
        children:   children
    }
}
function mini(view, state, root, onRefreshed=(x=>x)) {
    let place = render(view(act, state));
    root.appendChild(place);

    function render(node) {
        if (typeof node === "string" ||
            typeof node === "number") {
            return document.createTextNode(node)
        }
        const element = document.createElement(node.name);
        Object.entries(node.attributes).forEach(([key, value]) =>
            typeof value === "function"
                ? element.addEventListener(key, value)
                : element.setAttribute(key, value)
        );
        node.children.forEach(child => element.appendChild(render(child)));
        return element;
    }
    function refresh() {
        const newView = render(view(act, state), root);
        root.replaceChild(newView, place);
        place = newView;
        state = onRefreshed(state) || state;
    }
    function act(action) { return event => {
        const t = action(state, event); state = t === undefined ? state : t;
        refresh();
    }   }
}

// times utility
// can be used with a result [0...x-1] or to just do something x times.

const timesFunction = function(indexToValue) {
  if( isNaN(parseInt(Number(this.valueOf()))) ) {
    throw new TypeError("Object is not a valid number");
  }
  const result = [];
  for (let i = 0; i < Number(this.valueOf()); i++) {
    result.push(indexToValue(i));
  }
  return result;
};

String.prototype.times = timesFunction;
Number.prototype.times = timesFunction;

const value = evt => evt.srcElement.options[evt.srcElement.selectedIndex].value;

const constrain = state => {
  if (state.endDate < state.beginDate) { // end date must not be before begin date
      state.endDate = new Date(state.beginDate);
  }
};

const actions = {
    setDay:   id => (state, evt) => { state[id].setUTCDate(value(evt))    ; constrain(state);},
    setMonth: id => (state, evt) => { state[id].setUTCMonth(value(evt))   ; constrain(state);},
    setYear:  id => (state, evt) => { state[id].setUTCFullYear(value(evt)); constrain(state);}
};

const view = (label, id) => (act, state) =>
    h("div", { id: id }, [
        h("span", {style:"padding-right: 1em"}, label ),
        h("select", {change: act( actions.setDay(id))   }, (31).times( day =>
            h("option",  state[id].getUTCDate() === day+1
                         ? {selected:true}
                         : {value: day+1}, (day+1).toString() )
        ) ),
        h("select", {change: act( actions.setMonth(id)) }, (12).times( month =>
            h("option", state[id].getUTCMonth() === month
                        ? {selected:true}
                        :{value: month}, (month+1).toString() )
        ) ),
        h("select", {change: act( actions.setYear(id))  }, (10).times( year =>
            h("option", state[id].getUTCFullYear() === year+2019
                        ? {selected:true}
                        : {value: year+2019}, (year+2019).toString() )
        ) ),
    ]);

const progressStyle = (pct, redOnGreen) => {
    const red   = "rgba(255,0,0, 0.7)";
    const green = "rgba(115,153,150,0.7)";
    return redOnGreen
        ? `background: linear-gradient(90deg, ${red}, ${red} ${pct}%, ${green} ${pct}%, ${green} );`
        : `background: linear-gradient(90deg, ${green}, ${green} ${pct}%, ${red} ${pct}%, ${red} );`;
};

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

// church encoding of the lambda calculus in JavaScript

const id = x => x;

// -------------- Product and Sum type

const Tuple = n => [
    parmStore (n + 1) ( [] ) (parms => parms.reduce( (accu, it) => accu(it), parms.pop() ) ), // ctor
    ...n.times( idx => iOfN (n) (idx) () )                               // selectors
];

const iOfN = n => i => value => // from n curried params, take argument at position i,
    n === 0
    ? value
    : x => iOfN (n-1) (i-1) ( i === 0 ? x : value );


const parmStore = n => args => onDone =>  // n args to come
    n === 0
    ? onDone(args)
    : arg => parmStore(n - 1)([...args, arg]) (onDone); // store parms in array

const EitherOf = n => [
    ...n.times( idx => parmStore(n+1) ([]) (parms => parms[idx+1] (parms[0]) ) ), // ctors
    id
];

// ---------------- Specializations

const [Pair, fst, snd] = Tuple(2);

const [Left, Right, either] = EitherOf(2);

const Nothing  = Left() ;

/**
 * @module developerService, LCRUD services for developers, like all modules this service is a singleton
 */

let _nextDeveloperId = 0;

const nextDeveloperId = () => _nextDeveloperId++;

// we mimic to get the dev id asynchronously from the backend

const create = ({firstname="change", lastname="change", workPCT=100}) =>
    new Promise( (resolve, reject) =>
        // _nextDeveloperId > 0 ? reject("REMOTE ERROR") : // enable to show error handling
        setTimeout( () => resolve(nextDeveloperId()), 1000) // mimic delay from server call
    ).then( id =>
        ({id:id, firstname: firstname, lastname:lastname, workPCT: workPCT})
    );

const actions$1 = {
    setFirstname: dev  => (state, event) => { dev.firstname  = event.target.value;},
    setLastname:  dev  => (state, event) => { dev.lastname   = event.target.value;},
    setWorkPCT:   dev  => (state, event) => { dev.workPCT    = Number(event.target.value);},

    addDev: act => state => { // async actions need the act reference
        state.status = "...";
        const proxy = {id: -1, firstname:"", lastname:"", workPCT:0};
        state.developers.push(proxy);
        create({})
            .then ( dev => {
                Object.getOwnPropertyNames(dev).forEach( name => proxy[name] = dev[name]);
                state.status = "new developer with id "+dev.id+" added";
                act(id)();
            }).catch( err => {
                state.status = "error trying to create new developer: "+err;
                act(actions$1.removeDev(-1))(); // if there could be more than one, we need the webpr scheduler
            });
    },
    removeDev: id$$1  => state => {
        const used = state.projects.some( proj => proj.assigned.some( assignment => assignment.devId === id$$1));
        if (used) {
            state.status = "Cannot delete developer since there are still assignments.";
        } else {
            state.developers = state.developers.filter(dev => dev.id !== id$$1);
        }
    },
};

const addDev = actions$1.addDev;

const getLoad = (devId, state) =>
    state.projects.reduce( (sum,proj) =>
       sum + proj.assigned
               .filter(assignment => assignment.devId === devId)
               .map(assignment => assignment.assignedPCT)
               .reduce( (accu, cur)=> accu + cur, 0) ,0) ;

const overcommitted = (developer, state) => developer.workPCT < getLoad(developer.id, state);

const view$1 = dev => (act, state) =>
    h("div", {
      class:     "developer"+(dev.id === -1 ? " loading" : "") + (overcommitted(dev,state) ? " attention" : ""),
      id:        dev.id, // for DnD
      draggable: true,
      dragstart: evt => evt.dataTransfer.setData("text", evt.target.id)
    }, [
        h("button", { click: act(actions$1.removeDev(dev.id)) }, "-"),
        h("div", {}, [
            h("label", {}, "First Name: "),
            h("input", {
                type:   "text",
                value:  dev.firstname,
                change: act(actions$1.setFirstname(dev))}),
            h("label", {}, "Last Name: "),
            h("input", {
                type:   "text",
                value:  dev.lastname,
                change: act(actions$1.setLastname(dev))}),
            h("label", {}, "Works %: "),
            h("input", {
                type:   "text", maxlength:"3",
                value:  dev.workPCT,
                change: act(actions$1.setWorkPCT(dev))}),
            h("label", {}, "Load:"),
            h("div", {
                class: "load",
                style: progressStyle( getLoad(dev.id, state) * 100 / dev.workPCT , true),
            }, getLoad(dev.id, state) + " %")
        ]),
        h("img",{src:"img/img"+ ( dev.id === -1 ? "no" : dev.id % 8) + ".jpg"})
    ]);

/**
 * @module projectService, LCRUD services for propjects, singleton
 */

let _nextProjectId = 0;

const nextProjectId = () => _nextProjectId++;

const create$1 = ({name="", needsFTE=1}) => ({id:nextProjectId(), name:name, needsFTE:needsFTE, assigned: []});

const actions$2 = {
    setAssignedPCT: assignment => (state, event) => {assignment.assignedPCT = Number(event.target.value);},

    assign: (devId, project) => state => {
        project.assigned.push( {devId:devId, assignedPCT: getDevById(devId, state).workPCT} );
        state.status = 'Assigned developer to project.';
    },
    deleteAssignment: (project, assignment) => _ => {
      project.assigned = project.assigned.filter( it => it !== assignment);
    },
};

const assign = actions$2.assign;

const getDevById = (devId, state) => state.developers.find( dev => dev.id === devId );

const view$2 = (project, assignment) => (act, state) =>
      h("div", {}, [
         h("button", {
             class: "delete",
             click: act(actions$2.deleteAssignment(project, assignment))
         }, "x"),
         h("input", {
             type: "text", size:3,
             value: assignment.assignedPCT,
             change: act(actions$2.setAssignedPCT(assignment))}),
         h("span", {}, "" + getDevById(assignment.devId, state).firstname ),
         h("span", {}, "" + getDevById(assignment.devId, state).lastname ),
      ]);

const actions$3 = {
    setName:      proj => (state, event) => { proj.name      = event.target.value;},
    setNeedsFTE:  proj => (state, event) => { proj.needsFTE  = Number(event.target.value);},

    addPro:                state =>         { state.projects.push(  create$1({name:"change"})); },
    removePro:    id    => state =>         { state.projects = state.projects.filter(pro => pro.id !== id);  },
};

const addPro = actions$3.addPro;

const getFTEs = project =>
    project.assigned.reduce( (sum, assignment) => sum + assignment.assignedPCT / 100 ,0);

const onDrop = (project, act) => drop( (devId, to) =>
    (null == devId || '' === devId)
    ? act(state => {state.status = `Drag and drop did not work. Do not drag the image. Please try again.`;}) ()
    : act(assign(Number(devId), project)) ()
);

const view$3 = project => (act, state) =>
    h("div", {
      class:     "project" + (project.needsFTE < getFTEs(project) ? " attention" : ""),
      id:        project.id,
      drop:      onDrop(project, act), // asynchronous
      dragover:  allowDrop,
      dragleave: evt => evt.target.classList.remove("drop")
    }, [
        h("button", { click: act(actions$3.removePro(project.id)) }, "-"),
        h("input", {
            type: "text",
            value: project.name, size:12,
            change: act(actions$3.setName(project))}),
        h("span", {}, "needs"),
        h("input", {
            type: "text", size:4,
            value: project.needsFTE,
            change: act(actions$3.setNeedsFTE(project))}),
        h("span", {}, "FTE, has "+ getFTEs(project) + " FTE assigned. Open:"),
        h("div", {
            class: "load",
            style: progressStyle(getFTEs(project) * 100 / project.needsFTE, false ),
        }, project.needsFTE - getFTEs(project) ),
        h("div", { class: "assignments"},
            project.assigned.map( assignment => view$2(project, assignment)(act, state) )
        ),
    ]);

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

const view$4 = (act, state) =>
    h("main", {}, [
        view('Begin', 'beginDate')(act, state),
        view('End',   'endDate')  (act, state),

        h("div", {id: "developers"}, [
            h("button", { click: act(addDev(act)) }, "+"),
            ...state.developers.map( dev => view$1(dev)(act,state) )
          ]
        ),

        h("div", {id: "projects"},[
          h("button", { click: act(addPro) }, "+"),
          ...state.projects.map( project => view$3(project)(act,state) )
          ]
        ),

        h("div",{id:"status"}, state.status),
    ]);

mini(view$4, state, content, state => state.status = "");
