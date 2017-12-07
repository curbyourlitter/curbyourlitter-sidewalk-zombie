import {
    COMMUNITY_INPUT_UPDATE,
    FILTERS_CLEAR,
    REPORTS_UPDATE,
    YEAR_START_UPDATE,
    YEAR_END_UPDATE
}from './actions';

const DEFAULT_COMMUNITY_INPUT = 'All Community Input';
const DEFAULT_REPORTS = 'All 311 Data';
const DEFAULT_YEAR_END = new Date().getFullYear();
const DEFAULT_YEAR_START = DEFAULT_YEAR_END - 1;

export function communityInput(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        return DEFAULT_COMMUNITY_INPUT;
    }
    if (action.type === COMMUNITY_INPUT_UPDATE) {
        return action.value;
    }
    return state;
}

export function reports(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        return DEFAULT_REPORTS;
    }
    if (action.type === REPORTS_UPDATE) {
        return action.value;
    }
    return state;
}

export function yearStart(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        return DEFAULT_YEAR_START;
    }
    if (action.type === YEAR_START_UPDATE) {
        return action.value;
    }
    return state;
}

export function yearEnd(state, action) {
    if (!state || action.type === FILTERS_CLEAR) {
        return DEFAULT_YEAR_END;
    }
    if (action.type === YEAR_END_UPDATE) {
        return action.value;
    }
    return state;
}
