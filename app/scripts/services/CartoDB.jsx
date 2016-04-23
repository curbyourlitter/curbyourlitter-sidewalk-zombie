import qwest from 'qwest';

import config from '../config/config';

export function execute(sql, user, callback) {
    var cartodbSqlBase = `https://${user}.cartodb.com/api/v2/sql?`;
    qwest.get(cartodbSqlBase, { q: sql }, { cache: true })
        .then((xhr, data) => {
            callback(data.rows);
        });
}

export function isInGreenpoint(latlng, callback) {
    var sql = `SELECT ST_intersects(CDB_LatLng(${latlng[0]}, ${latlng[1]}), the_geom) AS in_greenpoint FROM zip_11222_unbuffered`;
    return execute(sql, config.cartodbUser, function (rows) {
        callback(rows[0].in_greenpoint);
    });
}
