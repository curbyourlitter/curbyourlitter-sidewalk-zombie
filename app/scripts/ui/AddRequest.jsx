import _ from 'underscore';
import React from 'react';
import { Alert, Button, Col, Grid, Input, Row } from 'react-bootstrap';
import { Link, Navigation } from 'react-router';
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
                            );
                        }
                    })()}
                </Row>
                {(() => {
                    if (this.state.error) {
                        return (
                            <Alert bsStyle='danger'>
                                There was an error while uploading the photo. Please try again and let us know if the error persists.
                            </Alert>
                        );
                    }
                })()}
                <Row>

                </Row>
            </Grid>
        );
    }
});

var BinTypeRadio = React.createClass({
    render: function () {
        var selected = this.props.value === this.props.selected,
            inputClasses = 'bin-type-input';
        if (selected) inputClasses += ' active';
        return (
            <div className="bin-type-radio">
                <input ref="input" type="radio" name="bin-type" onChange={this.props.onSelect} checked={selected} value={this.props.value} id={this.props.value}></input>
                <label htmlFor={this.props.value}>
                    <span className={inputClasses}>
                        <span></span>
                    </span>
                    <span className="bin-type-radio-label">{this.props.label}</span>
                </label>
                <div className="clearfix"></div>
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
                <input ref="input" type="checkbox" onChange={e => {}} checked={this.props.value} id="mailing-list-opt-in"></input>
                <span className={inputClasses}>
                    <span></span>
                </span>
                <label htmlFor="mailing-list-opt-in">I want to be added to the mailing list</label>
                <div className="clearfix"></div>
            </div>
        );
    }
});

var LocationInput = React.createClass({
    getInitialState: function () {
        return {
            address: null,
            error: null,
            enterAddress: null,
            gettingLocation: false,
            gotLocation: false,
            useFoundLocation: null,
            zip: 11222
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

    submitAddress: function () {
        this.setState({
            enterAddress: false,
            error: null,
            gettingLocation: true
        });
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
                this.setState({
                    error: 'There was an error while getting the position of the address you entered. Please try again and let us know if the problem persists.',
                    gettingLocation: false
                });
            }
        });
    },

    render: function () {
        var message,
            body;

        if (this.state.gettingLocation) {
            message = 'Getting location...';
        }
        else if (this.state.enterAddress) {
            message = 'Enter the location:';
            body = (
                <div>
                    <Input type="text" label="Address" placeholder="eg, 237 Eckford St" onChange={(e) => { this.setState({ address: e.target.value })}} value={this.state.address} />
                    <Input type="text" label="Zipcode" value={this.state.zip} readOnly />
                    <Button onClick={this.submitAddress}>Submit</Button>
                </div>
            );
        }
        else if (!this.props.latlng) {
            message = 'Help us find where the trash is.';
            body = (
                <div>
                    <Button className="btn-share" onClick={this.getLocation}>Share your location</Button>
                </div>
            );
        }
        else {
            if (this.state.gotLocation) {
                message = 'Got your location!';
            }
            else if (this.state.useFoundLocation === null) {
                message = 'Hey, we found location data in your photo, can we use it to place it on the map?';
                body = (
                    <Grid className="use-found-location">
                        <Row>
                            <Col className="column-yes" xs={3}>
                                <Button onClick={() => this.setState({ useFoundLocation: true })}>
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
            else if (this.state.useFoundLocation === true) {
                message = 'Using the location in the image.';
            }
        }

        if (this.state.error) {
            body = (
                <div>
                    <Alert bsStyle='danger'>{this.state.error}</Alert>
                    {body}
                </div>
            );
        }

        return (
            <div className="location-input">
                <div className="location-input-message">{message}</div>
                {body}
            </div>
        );
    }
});

export var AddRequest = React.createClass({
    mixins: [Navigation],

    getInitialState: function () {
        return {
            pk: null,
            latlng: null,
            type: null,
            comment: null,
            name: null,
            email: null,
            mailingListOptIn: false,

            error: false,
            isValid: false,
            submitting: false,
            success: false
        };
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
        return (fields.pk && fields.type && fields.name && fields.email);
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
                        this.transitionTo('/success');
                    }
                })
                .catch(() => {
                    this.setState({ error: true });
                });
        }
    },

    onTypeSelected: function (e) {
        this.updateField('type', e.target.value);
    },

    render: function () {
        return (
            <div className="add-request">
                <header>
                    <h1>Do you see litter?</h1>
                    <Link className="cancel" to="/">Cancel</Link>
                </header>
                <form className="add-request-form" onSubmit={this.submitRequest}>
                    <ImageInput label="Photo"
                        onChangeCallback={(image) => this.updateField('image', image)} 
                        onLocation={(latlng) => this.updateField('latlng', latlng)} 
                        onPk={(pk) => this.updateField('pk', pk)} />
                    <LocationInput onLocationChange={(l) => this.updateField('latlng', l)} latlng={this.state.latlng} />
                    <div>
                        <label>What do you think would help?</label>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="Litter Bin" value="litter_standard"/>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="Bottle & Can Recycling Bin" value="recycling_standard_bottle_can"/>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="Paper Recycling Bin" value="recycling_standard_paper"/>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="BigBelly" value="litter_bigbelly"/>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="Bottle & Can Recycling BigBelly" value="recycling_bigbelly_bottle_can"/>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="Paper Recycling BigBelly" value="recycling_bigbelly_paper"/>
                        <BinTypeRadio onSelect={this.onTypeSelected} selected={this.state.type} label="Other" value="other"/>
                    </div>
                    <Input type="textarea" className="comment" onChange={(e) => this.updateField('comment', e.target.value)} value={this.state.comment} placeholder="Write something here..." />
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
