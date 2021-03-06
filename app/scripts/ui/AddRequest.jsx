import _ from 'underscore';
import React from 'react';
import { Alert, Button, Col, Grid, Input, Row } from 'react-bootstrap';
import { History, Link } from 'react-router';
import qwest from 'qwest';

import config from '../config/config';
import { isInGreenpoint } from '../services/CartoDB.jsx';
import { BadLocationModal } from './BadLocationModal.jsx';

var geocoder = new google.maps.Geocoder;

var ImageInput = React.createClass({
    getInitialState: function () {
        return {
            error: null,
            progress: 0,
            submitting: false,
            submitted: false,
            thumbnail: null,
            value: null
        };
    },

    handleChange: function (e) {
        // When the image is set, try to upload it
        var file = e.target.files[0];
        this.setState({
            error: null,
            submitting: true,
            value: e.target.value
        });
        this.props.onChangeCallback();

        var formData = new FormData();
        if (file) {
            formData.append('image', file, file.name);
        }
        qwest.post(config.apiBase + '/canrequests/image/', formData, null, (xhr) => {
            xhr.upload.onprogress = (e) => {
                this.setState({ progress: Math.round((e.loaded / e.total) * 100) });
            };
        })
            .then((xhr, data) => {
                this.setState({
                    submitted: true,
                    thumbnail: data.thumb_url
                });
                if (data.lat && data.lon) {
                    this.props.onLocation([data.lat, data.lon]);
                }
                this.props.onPk(data.pk);
            })
            .catch((xhr, response, e) => {
                this.setState({ error: e });
            })
            .complete(() => {
                this.setState({ submitting: false });
            });
    },

    clear: function () {
        this.setState(this.getInitialState());
    },

    render: function () {
        var errorBlock = null;
        if (this.state.error) {
            errorBlock = (
                <Alert bsStyle='danger'>
                    There was an error while uploading the photo. Please try again and let us know if the error persists.
                </Alert>
            );
        }
        return (
            <div className="image-input">
                {(() => {
                    if (!(this.state.submitting || this.state.submitted)) {
                        return (
                            <div className="image-input">
                                <label htmlFor="image-input" className="btn btn-default btn-lg">
                                    <span className="image-input-icon"></span>
                                    <span className="image-input-btn-text">Upload a photo</span>
                                    <span className="clearfix"></span>
                                </label>
                                <div className="image-input-field">
                                    <Input accept="image/*" id="image-input" onChange={this.handleChange} type="file" value={this.state.value} />
                                </div>
                                {errorBlock}
                            </div>
                        );
                    }
                    else {
                        return (
                            <Grid>
                                <Row>
                                    <div className="image-input-thumbnail">
                                        {(() => {
                                            if (this.state.thumbnail) {
                                                return <img src={this.state.thumbnail} />;
                                            }
                                        })()}
                                    </div>
                                    <Col xs={9}>
                                        <Row>
                                            <div className="image-input-status">
                                                <div>
                                                    {this.state.submitting ? 'Uploading...' : ''}
                                                    {this.state.submitted ? 'Uploaded' : ''}
                                                </div>
                                            </div>
                                            <div className="image-input-actions">
                                                <a onClick={this.clear}>
                                                    {this.state.submitting ? 'Cancel' : ''}
                                                    {this.state.submitted ? 'Remove' : ''}
                                                </a>
                                            </div>
                                        </Row>
                                        <div className="image-input-message">
                                            {this.state.progress === 100 ? 'All done. Success!' : `${this.state.progress}%`}
                                        </div>
                                    </Col>
                                </Row>
                            </Grid>
                        );
                    }
                })()}
            </div>
        );
    }
});

var MailingListOptIn = React.createClass({
    handleClick: function (e) {
        this.props.onChange(!this.props.value);
        e.preventDefault();
    },

    render: function () {
        var inputClasses = 'mailing-list-opt-in-input';
        if (this.props.value) inputClasses += ' active';
        return (
            <div className="mailing-list-opt-in-radio" onClick={this.handleClick}>
                <input type="checkbox" onChange={e => {}} checked={this.props.value} id="mailing-list-opt-in"></input>
                <span className={inputClasses}>
                    <span></span>
                </span>
                <label htmlFor="mailing-list-opt-in">I want to be added to the mailing list</label>
                <div className="clearfix"></div>
            </div>
        );
    }
});

var AddressInput = React.createClass({
    getInitialState: function () {
        return {
            address: null
        }
    },

    componentDidMount: function () {
        if (this.props.latlng && !this.state.address) {
            this.findAddress();
        }
    },

    getAddressFromGeocoder: function (geocoderResult) {
        var street_number = _.find(geocoderResult.address_components, component => {
            return component.types.indexOf('street_number') >= 0;
        }).long_name;
        var street = _.find(geocoderResult.address_components, component => {
            return component.types.indexOf('route') >= 0;
        }).short_name;
        return street_number + ' ' + street;
    },

    isAccurateGeocodingResult: function (result) {
        var street_number = _.find(result.address_components, component => {
            return component.types.indexOf('street_number') >= 0;
        });
        var street = _.find(result.address_components, component => {
            return component.types.indexOf('route') >= 0;
        });
        return street_number && street;
    },

    findAddress: function (latlng) {
        latlng = (latlng ? latlng : this.props.latlng);
        var location = {
            lat: this.props.latlng[0],
            lng: this.props.latlng[1]
        };
        geocoder.geocode({'location': location}, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) return;
            if (results[0].partial_match) return;
            this.setState({
                address: this.getAddressFromGeocoder(results[0])
            });
        });
    },

    submitAddress: function () {
        this.props.onGeocodeBegin();
        var params = {
            address: `${this.state.address}, Brooklyn, NY ${config.zip}`,
            componentRestrictions: { postalCode: config.zip }
        };
        geocoder.geocode(params, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                // If forward geocode doesn't contain street number and street,
                // reject it
                if (this.isAccurateGeocodingResult(results[0])) {
                    var latlng = [results[0].geometry.location.lat(), results[0].geometry.location.lng()]
                    this.props.onGeocodeFinish(latlng);
                    this.setState({
                        address: this.getAddressFromGeocoder(results[0])
                    });
                }
                else {
                    this.props.onError("We're having a hard time finding that address in Greenpoint. Try again?");
                }
            }
            else {
                this.props.onError('There was an error while getting the position of the address you entered. Please try again and let us know if the problem persists.');
            }
        });
    },

    render: function () {
        return (
            <div className="address-input">
                <Input className="address-input-address" type="text" label="Where was this?" placeholder="eg, 237 Eckford St" onChange={(e) => this.setState({ address: e.target.value })} value={this.state.address} />
                <Button bsSize="large" onClick={this.submitAddress}>Update Location</Button>
            </div>
        );
    }
});

var LocationInput = React.createClass({
    getInitialState: function () {
        return {
            error: null,
            enterAddress: null,
            gettingLocation: false,
            gotLocation: false,
            useFoundLocation: null
        }
    },

    getLocation: function () {
        this.setState({
            error: null,
            gettingLocation: true
        });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    gettingLocation: false,
                    gotLocation: true
                });
                this.props.onLocationChange([ position.coords.latitude, position.coords.longitude ]);
            },
            (e) => {
                this.setState({
                    error: 'There was an error while getting your location. Do you have location enabled on your phone? Please try again and let us know if the error persists.',
                    gettingLocation: false
                });
            }
        );       
    },

    addressError: function (message) {
        this.setState({
            error: message,
            gettingLocation: false
        });
    },

    addressGeocodeBegin: function() {
        this.setState({
            enterAddress: false,
            error: null,
            gettingLocation: true
        });
    },

    addressGeocodeFinish: function(latlng) {
        this.setState({
            gettingLocation: false,
            gotLocation: true
        });
        this.props.onLocationChange(latlng);
    },

    useImageLocation: function () {
        this.setState({
            useFoundLocation: true
        });
        this.props.onLocationChange(this.props.imageLatlng);
    },

    render: function () {
        var message,
            body = <AddressInput onError={this.addressError} onGeocodeBegin={this.addressGeocodeBegin} onGeocodeFinish={this.addressGeocodeFinish} latlng={this.props.latlng} />;

        if (this.state.gettingLocation) {
            message = 'Getting location...';
        }
        else if (this.state.enterAddress) {
            message = 'Enter the location:';
        }
        else if (this.props.imageLatlng && !this.state.useFoundLocation) {
            message = 'Hey, we found location data in your photo, can we use it to place it on the map?';
            body = (
                <Grid className="use-found-location">
                    <Row>
                        <Col className="column-yes" xs={3}>
                            <Button onClick={() => this.useImageLocation()}>
                                Yes
                            </Button>
                        </Col>
                        <Col className="column-no" xs={9}>
                            <Button onClick={() => this.setState({ enterAddress: true })}>
                                No, I'll Add It Below
                            </Button>
                        </Col>
                    </Row>
                </Grid>
            );
        }
        else if (!this.props.latlng) {
            message = 'Help us find where the trash is.';
            body = (
                <div>
                    <Button bsSize="lg" className="btn-share" onClick={this.getLocation}>Share your location</Button>
                </div>
            );
        }
        else {
            if (this.state.gotLocation) {
                message = 'Got your location!';
            }
            else if (this.state.useFoundLocation === true) {
                message = 'Using the location in the image.';
            }
        }

        return (
            <div className="location-input">
                <div className="location-input-message">{message}</div>
                { this.state.error ?  <Alert bsStyle='danger'>{this.state.error}</Alert> : null }
                {body}
            </div>
        );
    }
});

export var AddRequest = React.createClass({
    mixins: [History],

    getInitialState: function () {
        return {
            pk: null,
            latlng: null,
            type: null,
            comment: null,
            name: null,
            email: null,
            mailingListOptIn: false,

            imageLatlng: null,

            error: false,
            isValid: false,
            isInGreenpoint: null,
            submitting: false,
            success: false
        };
    },

    updateLocation: function (value) {
        isInGreenpoint(value, (inGreenpoint) => {
            this.setState({ isInGreenpoint: inGreenpoint });
        });
        this.updateField('latlng', value);
    },

    badLocationModalClosed: function () {
        // TODO test with geolocated picture
        this.setState({
            isInGreenpoint: null
        });
    },

    updateField: function (name, value) {
        this.setState((previousState) => {
            previousState[name] = value;
            previousState.isValid = this.validateRequest(previousState);
            return previousState;
        });
    },

    getGeom: function () {
        return `POINT (${this.state.latlng[1]} ${this.state.latlng[0]})`;
    },

    getType: function () {
        var type = this.state.type;
        if (type === 'litter') {
            return 'litter';
        }
        else if (type.indexOf('recycling') === 0) {
            return 'recycling';
        }
    },

    getSubType: function () {
        var type = this.state.type;
        return type.substr(type.indexOf('_') + 1);
    },

    validateRequest: function (fields) {
        return (fields.pk && fields.type && fields.name && fields.email && fields.isInGreenpoint);
    },

    submitRequest: function (e) {
        e.preventDefault();
        if (this.validateRequest(this.state)) {
            this.setState({ submitting: true });

            var data = {
                    email: this.state.email,
                    geom: this.getGeom(),
                    name: this.state.name,
                    mailing_list_opt_in: this.state.mailingListOptIn
                },
                canType = this.getType(),
                canSubType = this.getSubType();

            if (canType) {
                data.can_type = canType;
            }
            if (canSubType) {
                data.can_subtype = canSubType;
            }
            if (this.state.comment) {
                data.comment = this.state.comment;
            }

            qwest.put(config.apiBase + `/canrequests/${this.state.pk}/`, data)
                .then(() => {
                    if (data.error) {
                        this.setState({
                            error: true,
                            submitting: false
                        });
                    }
                    else {
                        this.setState({
                            submitting: false,
                            success: true 
                        });
                        this.history.pushState(null, '/success');
                    }
                })
                .catch(() => {
                    this.setState({ error: true });
                });
        }
    },

    render: function () {
        return (
            <div className="add-request">
                <BadLocationModal show={this.state.isInGreenpoint === false} onDismiss={this.badLocationModalClosed}/>
                <header>
                    <h1>Do You See Litter?</h1>
                    <Link className="cancel" to="/">Cancel</Link>
                </header>
                <form className="add-request-form" onSubmit={this.submitRequest}>
                    <ImageInput label="Photo"
                        onChangeCallback={(image) => this.updateField('image', image)} 
                        onLocation={(latlng) => this.setState({ imageLatlng: latlng })}
                        onPk={(pk) => this.updateField('pk', pk)} />
                    <LocationInput onLocationChange={this.updateLocation} latlng={this.state.latlng} imageLatlng={this.state.imageLatlng} />
                    <Input type="text" onChange={(e) => this.updateField('name', e.target.value)} label="Name" value={this.state.name} placeholder="Name" />
                    <Input type="email" onChange={(e) => this.updateField('email', e.target.value)} label="Email Address" value={this.state.email} placeholder="Email Address" />
                    {(() => {
                        if (this.state.error) {
                            return (
                                <Alert bsStyle="danger">
                                    There was an error while submitting the request, please try again and let us know if the error persists.
                                </Alert>
                            );
                        }
                    })()}
                    <MailingListOptIn onChange={value => this.updateField('mailingListOptIn', value)} value={this.state.mailingListOptIn}/>
                    <Button type="submit" disabled={!this.state.isValid || this.state.submitting} block>
                        {this.state.submitting ?  'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </div>
        );
    }
});

export default AddRequest;
