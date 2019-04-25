/**
 * @module developerService, LCRUD services for developers, like all modules this service is a singleton
 */

export {create}

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
