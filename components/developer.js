import {h}                      from "../mini/mini.js";
import {progressStyle}          from "./helper.js";
import {id}                     from "../church/church.js";
import {create}                 from "../services/developerService.js";

export {view , addDev}

const actions = {
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
                act(actions.removeDev(-1))(); // if there could be more than one, we need the webpr scheduler
            });
    },
    removeDev: id  => state => {
        const used = state.projects.some( proj => proj.assigned.some( assignment => assignment.devId === id));
        if (used) {
            state.status = "Cannot delete developer since there are still assignments."
        } else {
            state.developers = state.developers.filter(dev => dev.id !== id);
        }
    },
};

const addDev = actions.addDev;

const getLoad = (devId, state) =>
    state.projects.reduce( (sum,proj) =>
       sum + proj.assigned
               .filter(assignment => assignment.devId === devId)
               .map(assignment => assignment.assignedPCT)
               .reduce( (accu, cur)=> accu + cur, 0) ,0) ;

const overcommitted = (developer, state) => developer.workPCT < getLoad(developer.id, state);

const view = dev => (act, state) =>
    h("div", {
      class:     "developer"+(dev.id === -1 ? " loading" : "") + (overcommitted(dev,state) ? " attention" : ""),
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
        h("img",{src:"img/img"+ ( dev.id === -1 ? "no" : dev.id % 8) + ".jpg"})
    ]);