/**
 * @module projectService, LCRUD services for propjects, singleton
 */

export {create}

let _nextProjectId = 0;

const nextProjectId = () => _nextProjectId++;

const create = ({name="", needsFTE=1}) => ({id:nextProjectId(), name:name, needsFTE:needsFTE, assigned: []});