import { Suite }            from "../test/test.js"
import { h, mini }          from "./mini.js";
import                           "../util/times.js"

const miniSuite = Suite("mini");

miniSuite.add("counter", assert => {
    const miniRoot = document.createElement("div");

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

    assert.is(miniRoot.querySelectorAll("#holder *").length, 5);

    miniRoot.querySelector("#plus").click();

    assert.is(miniRoot.querySelectorAll("#holder *").length, 6);

    miniRoot.querySelector("#minus").click();

    assert.is(miniRoot.querySelectorAll("#holder *").length, 5);

    miniRoot.querySelector("#minus").click();

    assert.is(miniRoot.querySelector("p").textContent, "negative not supported");

    miniRoot.querySelector("#reset").click();

    assert.is(miniRoot.querySelectorAll("#holder *").length, 5);

});


miniSuite.run();