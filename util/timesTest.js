import "./times.js" // we import no symbols as they are set on the respective prototypes
import { Suite } from "../test/test.js"

const util_times = Suite("util-times");

util_times.add("str", assert => {

    const first10 = '10'.times( x => x);

    assert.is(first10.length, 10);
    assert.is(first10[0], 0);
    assert.is(first10[9], 9);

    assert.is(64, '8'.times(x => (x+1) * (x+1)).reverse()[0] )

});

util_times.add("num", assert => {

    const first10 = (10).times( x => x);

    assert.is(first10.length, 10);
    assert.is(first10[0], 0);
    assert.is(first10[9], 9);

});

util_times.run();