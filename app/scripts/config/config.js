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
config.mobile = true;
config.mobileLimit = 100;
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
config.bintypes = {
    litter: {
        display: "litter bin",
        subtypes: [
            {
                description: "A covered litter bin accepts all types of pedestrian trash. Everything thrown away here goes to a landfill.",
                display: "Standard",
                label: "standard",
                image: "/images/bintypes/litter_standard.jpg"
            },
            {
                description: "A BigBelly litter bin uses solar panels to compact trash that is sent to a landfill.",
                display: "BigBelly",
                label: "bigbelly",
                "image": "/images/bintypes/litter_bigbelly.jpg"
            }
        ]
    },
    recycling: {
        display: "recycling bin",
        subtypes: [
            {
                description: "Bottle & Can recycling bins take only metal cans and plastic bottles to be recycled.",
                display: "Standard Bottle & Bin",
                label: "standard_bottle_can",
                image: "/images/bintypes/recycling_standard_bottle_can.jpg"
            },
            {
                description: "Paper recycling bins take only clean paper to be recycled.",
                display: "Standard Paper",
                label: "standard_paper",
                image: "/images/bintypes/recycling_standard_paper.jpg"
            },
            {
                description: "This type of bin uses solar panels to compact metal cans and plastic bottles to be recycled.",
                display: "BigBelly Bottle & Bin",
                label: "bigbelly_bottle_can",
                image: "/images/bintypes/recycling_bigbelly_bottle_can.jpg"
            },
            {
                description: "This type of bin uses solar panels to compact clean paper to be recycled.",
                display: "BigBelly Paper",
                label: "bigbelly_paper",
                image: "/images/bintypes/recycling_bigbelly_paper.jpg"
            }
        ]
    }
};
config.timezone = 'America/New_York';

export default config;