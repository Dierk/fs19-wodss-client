// church encoding of the lambda calculus in JavaScript

import "../util/times.js"

export {
    id, konst, flip, kite, cmp,
    Pair, fst, snd,
    Left, Right, either,
    Nothing, Just, maybe, bindMaybe,
    curry, uncurry,
    Tuple, EitherOf
}

const id = x => x;

const beta = f => x => f(x);

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
