import config from '../config/config';

const DEFAULT_OPTIONS = {
    height: 300,
    width: 400,
    zoom: 17
};

function isRetina() {
    if (!window.devicePixelRatio) {
        return false;
    }
    return window.devicePixelRatio >= 2;
}

export function getStaticMapUrl(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    let format = '.png';
    if (isRetina()) {
        format = '@2x' + format;
    }

    let overlay = `url-${config.staticMapIcons[options.type]}${format}(${options.longitude},${options.latitude})`;
    overlay = encodeURIComponent(overlay);

    const url = `${config.mapbox.staticMapEndpoint}/${config.mapbox.mapId}/${overlay}/${options.longitude},${options.latitude},${options.zoom}/${options.width}x${options.height}${format}?access_token=${config.mapbox.accessToken}`;
    return url;
}
