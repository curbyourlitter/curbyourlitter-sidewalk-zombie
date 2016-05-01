export const FILTERS_CLEAR = 'FILTERS_CLEAR';
export const COMMUNITY_INPUT_UPDATE = 'COMMUNITY_INPUT_UPDATE';
export const REPORTS_UPDATE = 'REPORTS_UPDATE';
export const YEAR_START_UPDATE = 'YEAR_START_UPDATE';
export const YEAR_END_UPDATE = 'YEAR_END_UPDATE';

export function filtersClear() {
    return {
        type: FILTERS_CLEAR
    };
}

export function communityInputUpdate(value) {
    return {
        type: COMMUNITY_INPUT_UPDATE,
        value: value
    };
}

export function reportsUpdate(value) {
    return {
        type: REPORTS_UPDATE,
        value: value
    };
}

export function yearStartUpdate(value) {
    return {
        type: YEAR_START_UPDATE,
        value: value
    };
}

export function yearEndUpdate(value) {
    return {
        type: YEAR_END_UPDATE,
        value: value
    };
}
