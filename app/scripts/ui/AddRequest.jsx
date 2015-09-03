import _ from 'underscore';
import React from 'react';
import { Button, Col, Grid, Input, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import qwest from 'qwest';

import config from '../config/config';

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
                this.setState({ progress: (e.loaded / e.total) * 100 });
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
                    {(() => {
                        if (!(this.state.submitting || this.state.submitted)) {
                            return (
                                <div className="image-input-field">
                                    <Input accept="image/*" onChange={this.handleChange} type="file" label={this.props.label} value={this.state.value} />
                                </div>
                            );
                        }
                        else {
                            return (
                                <Col xs={9}>
                                    <Row>
                                        <div className="image-input-message">
                                            <div>
                                                {this.state.submitting ? 'uploading...' : ''}
                                                {this.state.submitted ? 'uploaded' : ''}
                                            </div>
                                            <div>
                                                {this.state.progress}%
                                            </div>
                                        </div>
                                        <div className="image-input-actions">
                                            <a onClick={this.clear}>remove</a>
                                        </div>
                                    </Row>
                                </Col>
                            );
                        }
                    })()}
                </Row>
            </Grid>
        );
    }
});

var LocationInput = React.createClass({
    getInitialState: function () {
        return {
            address: null,
            gettingLocation: false,
            gotLocation: false,
            useFoundLocation: null,
            zip: 11222
        }
    },

    getLocation: function () {
        this.setState({ gettingLocation: true });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position.coords);
                this.setState({
                    gettingLocation: false,
                    gotLocation: true
                });
                this.props.onLocationChange([ position.coords.latitude, position.coords.longitude ]);
            },
            (e) => {
                // TODO handle more appropriately
                console.warn(e);
                this.setState({ gettingLocation: false });
            }
        );       
    },

    submitAddress: function () {
        this.setState({ gettingLocation: true });
        var geocoder = new google.maps.Geocoder,
            params = {
                address: `${this.state.address} , Brooklyn, NY ${this.state.zip}`,

                // Keep it in the zip code we're interested in
                componentRestrictions: {
                    postalCode: this.state.zip.toString()
                }
            };
        geocoder.geocode(params, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                var latlng = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
                this.props.onLocationChange(latlng);
                this.setState({
                    gettingLocation: false,
                    gotLocation: true
                });
            }
            else {
                // TODO handle more appropriately
                console.warn(status);
                this.setState({ gettingLocation: false });
            }
        });
    },

    render: function () {
        var message,
            body;

        if (this.state.gettingLocation) {
            message = 'Getting location...';
        }
        else if (!this.props.latlng) {
            message = 'Help us find where the trash is.';
            body = <Button block onClick={this.getLocation}>Share your location</Button>;
        }
        else {
            if (this.state.gotLocation) {
                message = 'Got your location!';
            }
            else if (this.state.useFoundLocation === null) {
                message = 'Hey, we found location data in your photo, can we use it to place it on the map?';
                body = (
                    <div>
                        <Button onClick={() => this.setState({ useFoundLocation: true })}>
                            Yes
                        </Button>
                        <Button onClick={() => this.setState({ useFoundLocation: false })}>
                            No, I'll do it
                        </Button>
                    </div>
                );
            }
            else if (this.state.useFoundLocation === true) {
                message = 'Using the location in the image.';
            }
            else if (this.state.useFoundLocation === false) {
                message = 'Enter the location:';
                body = (
                    <div>
                        <Input type="text" label="Address" placeholder="eg, 237 Eckford St" onChange={(e) => { this.setState({ address: e.target.value })}} value={this.state.address} />
                        <Input type="text" label="Zipcode" value={this.state.zip} readOnly />
                        <Button onClick={this.submitAddress}>Submit</Button>
                    </div>
                );
            }
        }

        return (
            <div className="location-input">
                <div className="location-input-message">{message}</div>
                {body}
            </div>
        );
    }
});

var AddRequestForm = React.createClass({
    getInitialState: function () {
        return {
            comment: null,
            email: null,
            image: null,
            name: null,
            latlng: null,
            pk: null
        };
    },

    imageChange: function (image) {
        this.setState({ image: image });
    },

    locationChange: function (latlng) {
        this.setState({ latlng: latlng });
    },

    pkChange: function (pk) {
        this.setState({ pk: pk });
    },

    render: function () {
        return (
            <form className="add-request-form" onSubmit={this.props.submitRequest}>
                <ImageInput onChangeCallback={this.imageChange} onLocation={this.locationChange} onPk={this.pkChange} label="Photo" />
                <LocationInput onLocationChange={(l) => this.setState({ latlng: l })} latlng={this.state.latlng} />
                <Input type="select" onChange={(e) => this.setState({ canType: e.target.value })} label="Can type" value={this.state.canType}>
                    <option value="bigbelly">bigbelly</option>
                    <option value="recycling">recycling</option>
                    <option value="trash">trash</option>
                </Input>
                <Input type="select" onChange={(e) => this.setState({ canSubType: e.target.value })} label="Can size" value={this.state.canSubType}>
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option value="large">large</option>
                </Input>
                <Input type="textarea" onChange={(e) => this.setState({ comment: e.target.value })} value={this.state.comment} label="Comment (optional)" />
                <Input type="text" onChange={(e) => this.setState({ name: e.target.value })} label="Name" value={this.state.name} />
                <Input type="email" onChange={(e) => this.setState({ email: e.target.value })} label="Email Address" value={this.state.email} />
                <Button type="submit" disabled={this.props.submitting} block>
                    {this.props.submitting ?  'submitting...' : 'submit'}
                </Button>
            </form>
        );
    }
});

export var AddRequest = React.createClass({
    getInitialState: function () {
        return {
            requestType: null,
            submitting: false,
            success: false
        };
    },

    validateRequest: function () {
        return (this.state.requestType && this.props.pinDropLatlng && this.state.name && this.state.email);
    },

    submitRequest: function (e) {
        e.preventDefault();
        if (this.validateRequest()) {
            var latlng = this.props.pinDropLatlng,
                geomWkt = `POINT (${latlng.lng} ${latlng.lat})`;
            var formData = new FormData();

            if (this.state.canType) {
                formData.append('can_type', this.state.canType);
            }
            if (this.state.canSubType) {
                formData.append('can_subtype', this.state.canSubType);
            }
            if (this.state.comment) {
                formData.append('comment', this.state.comment);
            }
            if (this.state.image) {
                formData.append('image', this.state.image, this.state.image.name);
            }
            formData.append('name', this.state.name);
            formData.append('email', this.state.email);
            formData.append('geom', geomWkt);

            this.setState({ submitting: true });
            qwest.post(config.apiBase + '/canrequests/', formData)
                .then(() => {
                    this.setState({
                        submitting: false,
                        step: null,
                        success: true 
                    });
                })
                .catch(() => console.warn('error'));
        }
    },

    render: function () {
        return (
            <AddRequestForm/>
        );
    }
});

export default AddRequest;
