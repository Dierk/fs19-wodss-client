import { Suite }            from "../test/test.js"
import { h, mini }          from "./mini.js";
import                           "../util/times.js"

const miniSuite = Suite("mini");

miniSuite.add("counter", assert => {
    // setup
    const miniContainer = document.createElement("div");
    const miniRoot = document.createElement("div");
    miniContainer.appendChild(miniRoot);
    document.getElementsByTagName("body")[0].appendChild(miniContainer);

    const actions = {
        dec : state => state - 1,
        inc : state => state + 1
    };


    const view = (act, state) =>
        h("div", {id: "holder"}, [
            h("h1",     { style: "color:red"      }, state),
            h("button", { id: "minus",click: act(actions.dec) }, "-"),      // declarative variant
            h("button", { id: "plus", click: act(actions.inc) }, "+"),
            h("button", { id: "reset",click: act(_ => 0 )     }, "0"),      // inline variant
            ...state.times( x => h("p", {}, x) ),                           // dynamic element count
            h("p",{}, state < 0 ? "negative not supported" : ""),           // conditional entries
        ]);

    mini(view, 0, miniRoot); // initial state is 0

    // stimuli and assertions

    assert.is(5 + 0, document.getElementById("holder").childElementCount);

    document.getElementById("plus").click();

    assert.is(5 + 1, document.getElementById("holder").childElementCount);

    document.getElementById("minus").click();

    assert.is(5 + 0, document.getElementById("holder").childElementCount);

    document.getElementById("minus").click();

    assert.is("negative not supported", document.getElementById("holder").childNodes[4].textContent);

    document.getElementById("reset").click();

    assert.is(5 + 0, document.getElementById("holder").childElementCount);

    // cleanup

    document.getElementsByTagName("body")[0].removeChild(miniContainer);
});


miniSuite.run();