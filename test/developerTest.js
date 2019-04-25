import { Suite }      from "../test/test.js"

import {view, addDev} from "../components/developer.js"
import {mini}         from "../mini/mini.js"

const developerSuite = Suite("developer");

developerSuite.add("one dev", assert => {

        const oneDev = {id:0, firstname:"f", lastname:"l", workPCT:50};
        const state = {developers: [ oneDev ], projects:   [ ], status: ""};
        const mockAct = foo => foo;

        const div = view(oneDev)(mockAct,state);

        // unit test against the vdom

        assert.is(div.name, "div");
        assert.is(div.attributes.class, "developer");
        assert.is(div.attributes.id, 0);
        assert.is(div.children.length, 3); // button, form div, image
        assert.is(div.children[1].name, "div");
        assert.is(div.children[1].children.length, 8); // label, content for fn, ln, pct, load

        // integration test against dom

        const dom = document.createElement("div");

        mini(view(oneDev), state, dom);

        assert.is(dom.querySelectorAll(".developer").length, 1);
        assert.is(dom.querySelectorAll("label").length, 4);
    }
);

developerSuite.run();