import {h} from "./mini/mini.js";
import "./util/times.js";

export { view }

const value = evt => evt.srcElement.options[evt.srcElement.selectedIndex].value;

const actions = {
    setDay:   id => (state, evt) => { state[id].setUTCDate(value(evt))     },
    setMonth: id => (state, evt) => { state[id].setUTCMonth(value(evt))    },
    setYear:  id => (state, evt) => { state[id].setUTCFullYear(value(evt)) }
};

const view = (label, id) => (act, state) =>
    h("div", { id: id }, [
        label + " Date: " + state[id].toLocaleDateString(),
        h("select", {change: act( actions.setDay(id))   }, (31).times( day =>
            h("option",  state[id].getUTCDate() === day+1 ? {selected:true} : {value: day+1}, (day+1).toString() )
        ) ),
        h("select", {change: act( actions.setMonth(id)) }, (12).times( month =>
            h("option", state[id].getUTCMonth() === month ? {selected:true} :{value: month}, (month+1).toString() )
        ) ),
        h("select", {change: act( actions.setYear(id))  }, (10).times( year =>
            h("option", state[id].getUTCFullYear() === year+2019 ? {selected:true} :{value: year+2019}, (year+2019).toString() )
        ) ),
    ]);

