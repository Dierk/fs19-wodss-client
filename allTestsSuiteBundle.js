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
            console.log(1);
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
function mini(view, initialState, root) {
    let state = initialState;
    let place = render(view(act, state));
    root.appendChild(place);

    function render(node) {
        if (typeof node === "string" ||
            typeof node === "number") {
            return document.createTextNode(node)
        }
        const element = document.createElement(node.name);
        for (let key in node.attributes) {
            const value = node.attributes[key];
            if (typeof value === "function") {
                element.addEventListener(key, value);
            } else {
                element.setAttribute(key, value);
            }
        }
        node.children.forEach(child => element.appendChild(render(child)));
        return element;
    }
    function refresh() {
        const newView = render(view(act, state), root);
        root.replaceChild(newView, place);
        place = newView;
    }
    function act(action) { return () => { state = action(state); refresh(); } }
}

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

// importing all tests that make up the suite of tests that are build on the ES6 module system
