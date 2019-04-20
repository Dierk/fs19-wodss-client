import {h} from "../mini/mini.js";
import          "../util/times.js";

export { view }

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

