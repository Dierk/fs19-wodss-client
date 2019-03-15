import {padLeft, padRight}  from "./strings.js";
import { Suite }            from "../test/test.js"

const util_strings = Suite("util-strings");

util_strings.add("padLeft", assert => {

    assert.is(padLeft("a",2), " a");
    assert.is(padLeft("a",1), "a");
    assert.is(padLeft("a",0), "a");

});

util_strings.add("padRight", assert => {

    // assert.is(false);
    assert.is(padRight("a",2), "a ");
    assert.is(padRight("a",1), "a");
    assert.is(padRight("a",0), "a");

});

util_strings.run();