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

// string utilities

// appends blanks to the right until the string is of size extend
// padRight :: String, Int -> String
function padRight(str, extend) {
    return "" + str + fill(str, extend);
}

// appends blanks to the left until the string is of size extend
// padLeft :: String, Int -> String
function padLeft(str, extend) {
    return "" + fill(str, extend) + str;
}

function fill(str, extend) {
    const len = str.toString().length; // in case str is not a string
    if (len > extend) {
        return "";
    }
    return " ".repeat(extend - len);
}

// church encoding of the lambda calculus in JavaScript

const id = x => x;

const konst = x => y => x;

const flip = f => x => y => f(y)(x);

const kite = flip(konst);

// -----

// Bluebird, composition
const cmp = f => g => x => f(g(x));

// ---- curry

// curry :: ((a,b)->c) -> a -> b -> c
const curry = f => x => y => f(x,y);

// uncurry :: ( a -> b -> c) -> ((a,b) -> c)
const uncurry = f => (x,y) => f(x)(y);

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
const Just     = Right  ;
const maybe    = m => f => either (m) (konst(f)) ;

//    bindMaybe :: m a -> (a -> m b) -> mb
const bindMaybe = ma => f => maybe (ma) (ma) (f);

// The test "framework", exports the Suite function plus a total of how many assertions have been tested

let total = 0;

function Assert() {
    const results = []; // [Bool], true if test passed, false otherwise
    return {
        results: results,
        true: (testResult) => {
            if (!testResult) { console.error("test failed"); }
            results.push(testResult);
        },
        is: (actual, expected) => {
            const testResult = actual === expected;
            if (!testResult) {
                console.error("test failure. Got '"+ actual +"', expected '" + expected +"'");
            }
            results.push(testResult);
        }
    }
}

const [Test, name, logic] = Tuple(2); // data type to capture test to-be-run

function testing(name, callback) {
    const assert = Assert();
    callback(assert);
    report(name, assert.results);
}

function Suite(suiteName) {
    const tests = []; // [Test]
    const suite = {
        test: (testName, callback) => testing(suiteName + "-"+ testName, callback),
        add:  (testName, callback) => tests.push(Test (testName) (callback)),
        run:  () => {
            const suiteAssert = Assert();
            tests.forEach( test => test(logic) (suiteAssert) );
            total += suiteAssert.results.length;
            if (suiteAssert.results.every( id )) { // whole suite was ok, report whole suite
                report("suite " + suiteName, suiteAssert.results);
            } else { // some test in suite failed, rerun tests for better error indication
                tests.forEach( test => suite.test( test(name), test(logic) ) );
            }
        }
    };
    return suite;
}

// test result report
// report :: String, [Bool] -> DOM ()
function report(origin, ok) {
    const extend = 20;
    if ( ok.every( elem => elem) ) {
        write(" "+ padLeft(ok.length, 3) +" tests in " + padRight(origin, extend) + " ok.");
        return;
    }
    let reportLine = "    Failing tests in " + padRight(origin, extend);
    bar(reportLine.length);
    write("|" + reportLine+ "|");
    for (let i = 0; i < ok.length; i++) {
        if( ! ok[i]) {
            write("|    Test #"+ padLeft(i, 3) +" failed                     |");
        }
    }
    bar(reportLine.length);
}

function write(message) {
    const out = document.getElementById('out');
    out.innerText += message + "\n";
}

function bar(extend) {
    write("+" + "-".repeat(extend) + "+");
}

const util_times = Suite("util-times");

util_times.add("str", assert => {

    const first10 = '10'.times( x => x);

    assert.is(first10.length, 10);
    assert.is(first10[0], 0);
    assert.is(first10[9], 9);

    assert.is(64, '8'.times(x => (x+1) * (x+1)).reverse()[0] );

});

util_times.add("num", assert => {

    const first10 = (10).times( x => x);

    assert.is(first10.length, 10);
    assert.is(first10[0], 0);
    assert.is(first10[9], 9);

});

util_times.run();

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

const churchSuite = Suite("church");

churchSuite.add("identity", assert => {

        // identity
        assert.is( id(0) , 0);
        assert.is( id(1) , 1);
        assert.is( id , id);    // JS has function identity
        assert.true( id == id);     // JS has function equality by string representation
        assert.true( "x => x" == id);

        // function equivalence
        const other = x => x;
        assert.true( "x => x" == other);

        const alpha = y => y;
        assert.true( alpha != id );  // JS has no alpha equivalence

        // in JS, a == b && a == c  does not imply b == c
        assert.true( id != other);
        assert.true( id.toString() == other.toString());

        assert.is( id(id) , id);

    }
);


churchSuite.add("konst", assert => {

        assert.is(konst(5)(1) , 5);
        assert.is(konst(5)(2) , 5);

        assert.is(konst(id)(0) , id);
        assert.is(konst(id)(0)(1) , 1); // id(1)

    }
);


churchSuite.add("kite", assert => {
        assert.is(kite(1)(5) , 5);
        assert.is(kite(2)(5) , 5);

    }
);

churchSuite.add("flip", assert => {
        const append = x => y => x + y;
        assert.is( append("x")("y") , "xy");
        assert.is( flip(append)("x")("y") , "yx");

        const backwards = flip(append);
        assert.is( backwards("x")("y") , "yx");

    }
);


churchSuite.add("composition", assert => {

        const inc = x => x + 1;
        assert.is( cmp(inc)(inc)(0) , 2);

        const append = x => y => x + y;          // have an impl.
        const f2 = x => y => append(x)(y); // curried form for experiment
        const f1 = x =>      f2(x);
        const f0 =           f1;

        assert.is( f2("x")("y") , "xy");
        assert.is( f1("x")("y") , "xy");
        assert.is( f0("x")("y") , "xy");
    }
);

churchSuite.add("Pair", assert => {
        const pair = Pair(0)(1);      // constituent of a product type
        assert.is( pair(fst)   , 0);  // p(konst) (pick first element of pair)
        assert.is( pair(snd)   , 1);  // p(kite)  (pick second element of pair)
    }
);

churchSuite.add("either", assert => {

        const left = Left(true);   // constituent of a sum type
        assert.true( either (left) (id) (konst(false)) );  // left is true, right is false

        const right = Right(true);   // constituent of a sum type
        assert.true( either (right) (konst(false)) (id) );  // left is false, right is true

    }
);

churchSuite.add("maybe", assert => {
        const no = Nothing;
        assert.true( maybe (no) ( true ) (konst(false)) );  // test the nothing case

        const good = Just(true);
        assert.true( maybe (good) ( false ) (id) );  // test the just value

        const bound = bindMaybe(Just(false))( b => Right(!(b))); // bind with not
        assert.true( maybe (bound) ( false ) (id) );  // test the just value
    }
);

churchSuite.add("curry", assert => {

        function add2(x,y) { return x + y }
        const inc = curry(add2);
        assert.is( inc(1)(1) ,  2);
        assert.is( inc(5)(7) , 12);

        const add3 = uncurry(curry(add2));
        assert.is( add3(1,1) , 2 );

    }
);

churchSuite.add("tuple3", assert => {

     const [Person, firstname, lastname, age] = Tuple(3);

     const dierk = Person("Dierk")("König")(50);

     assert.is(dierk(firstname), "Dierk");
     assert.is(dierk(lastname),  "König");
     assert.is(dierk(age),       50);

});

churchSuite.add("choice", assert => {

    const [Cash, CreditCard, Transfer, match] = EitherOf(3); // generalized sum type

    const pay = payment => match(payment)                  // "pattern" match
        (() =>
             amount => 'pay ' + amount + ' cash')
        (({number, sec}) =>
             amount => 'pay ' + amount + ' with credit card ' + number + ' / ' + sec)
        (([from, to]) =>
             amount => 'pay ' + amount + ' by wire from ' + from + ' to ' + to);

    let payment = Cash();
    assert.is(pay(payment)(50), 'pay 50 cash');

    payment = CreditCard({number: '0000 1111 2222 3333', sec: '123'});
    assert.is(pay(payment)(50), 'pay 50 with credit card 0000 1111 2222 3333 / 123');

    payment = Transfer(['Account 1', 'Account 2']);
    assert.is(pay(payment)(50), 'pay 50 by wire from Account 1 to Account 2');

});

churchSuite.run();

const progressStyle = (pct, redOnGreen) => {
    const red   = "rgba(255,0,0, 0.7)";
    const green = "rgba(115,153,150,0.7)";
    return redOnGreen
        ? `background: linear-gradient(90deg, ${red}, ${red} ${pct}%, ${green} ${pct}%, ${green} );`
        : `background: linear-gradient(90deg, ${green}, ${green} ${pct}%, ${red} ${pct}%, ${red} );`;
};

const isNull = it => null === it || undefined === it;

const NullSafe = x => {
    const maywrap = y => !isNull(y) && y.then ? y : NullSafe(y) ;
    return {
       then:  fn => maywrap( isNull(x) ? x : fn(x) ),
       value: () => x,
    }
};

const select = cssSelector => document.querySelector(cssSelector);

// adapted from
// https://stackoverflow.com/questions/4588119/get-elements-css-selector-when-it-doesnt-have-an-id
function selectorFor(element) {
    const names = [];
    while (element.parentNode) {
        if (element.id && isNaN(element.id)) { // numbers can be used in ids but they do not work in selectors
            names.unshift('#' + element.id);
            break;
        } else {
            if (element === element.ownerDocument.documentElement) {
                names.unshift(element.tagName);
            } else {
                let count = 1;
                let e = element;
                while (e.previousElementSibling) {
                    e = e.previousElementSibling;
                    count++;
                }
                names.unshift(element.tagName + ":nth-child(" + count + ")");
            }
            element = element.parentNode;
        }
    }
    return names.join(" > ");
}

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
        if (typeof node === "string" || typeof node === "number") {
            return document.createTextNode(node)
        }
        const element = document.createElement(node.name);
        Object.entries(node.attributes).forEach(([key, value]) =>
            typeof value === "function" ? element.addEventListener(key, value) : element.setAttribute(key, value)
        );
        node.children.forEach(child => element.appendChild(render(child)));
        return element;
    }
    function refresh() {
        const focusSelector = NullSafe(":focus").then(select).then(selectorFor).value();
        const newView = render(view(act, state));
        root.replaceChild(newView, place);
        place = newView;
        NullSafe(focusSelector).then(select).then( el => el.focus());
        NullSafe(onRefreshed(state)).then(newState => state = newState);
    }
    function act(action) { return event => {
        NullSafe(action(state, event)).then( newState => state = newState) ;
        refresh();
    }   }
}

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
                Object.assign(proxy, dev); // fill proxy with values from dev
                state.status = "new developer with id "+dev.id+" added";
                act(id)();
            }).catch( err => {
                state.status = "error trying to create new developer: "+err;
                act(actions.removeDev(-1))(); // if there could be more than one, we need the webpr scheduler
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
                style: progressStyle( getLoad(dev.id, state) * 100 / dev.workPCT , true),
            }, getLoad(dev.id, state) + " %")
        ]),
        h("img",{src:"img/img"+ ( dev.id === -1 ? "no" : dev.id % 8) + ".jpg"})
    ]);

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

// importing all tests that make up the suite of tests that are build on the ES6 module system
