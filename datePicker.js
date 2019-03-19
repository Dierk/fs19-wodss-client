import {h} from "./mini/mini.js";
import "./util/times.js";

export { view }

const value = evt => evt.srcElement.options[evt.srcElement.selectedIndex].value;

const actions = {
    setDay:   (id, day)   => state => { state[id].setUTCDate(day);      return state;},
    setMonth: (id, month) => state => { state[id].setUTCMonth(month);   return state;},
    setYear:  (id, year)  => state => { state[id].setUTCFullYear(year); return state;}
};

const view = (label, id) => (act, state) =>
    h("div", { id: id }, [
        label + " Date: " + state[id].toLocaleDateString(),
        h("select", {change: evt => act( actions.setDay(id, value(evt)))   () }, (31).times( day =>
            h("option",  state[id].getUTCDate() === day+1 ? {selected:true} : {value: day+1}, (day+1).toString() )
        ) ),
        h("select", {change: evt => act( actions.setMonth(id, value(evt))) ()}, (12).times( month =>
            h("option", state[id].getUTCMonth() === month ? {selected:true} :{value: month}, (month+1).toString() )
        ) ),
        h("select", {change: evt => act( actions.setYear(id, value(evt)))  ()}, (10).times( year =>
            h("option", state[id].getUTCFullYear() === year+2019 ? {selected:true} :{value: year+2019}, (year+2019).toString() )
        ) ),
    ]);

