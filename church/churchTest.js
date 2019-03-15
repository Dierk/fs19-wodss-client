
import { Suite } from "../test/test.js"

import {
        id, konst, flip, kite, cmp,
        Pair, fst, snd,
        Left, Right, either,
        Nothing, Just, maybe, bindMaybe,
        curry, uncurry,
        Tuple, EitherOf
} from "./church.js"

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