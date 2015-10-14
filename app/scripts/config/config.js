import dev from './development';
import prod from './production';

var config;

if (process.env.NODE_ENV === 'development') {
    config = dev;
}
else if (process.env.NODE_ENV === 'production') {
    config = prod;
}

config.bbox = [40.709532,-73.967514,40.739584,-73.923397];
config.cartodbUser = 'curbyourlitter';
config.reportFilters = {
    dirty_conditions: true,
    overflowing_litter_basket: true,
    sanitation_conditions: true
};
config.requestFilters = {
    litter: true,
    recycling: true,
    sightings: true
};
config.tables = {
    can: 'cans',
    report: 'threeoneone',
    request: 'canrequests'
};
config.timezone = 'America/New_York';

export default config;
