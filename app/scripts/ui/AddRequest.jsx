import _ from 'underscore';
import React from 'react';
import { Button, Input } from 'react-bootstrap';
import { Link } from 'react-router';
import qwest from 'qwest';

import config from '../config/config';

var ImageInput = React.createClass({
    getInitialState: function () {
        return {
            value: null
        };
    },

    handleChange: function (e) {
        this.setState({ value: e.target.value });
        this.props.onChangeCallback({ image: e.target.files[0] });
    },

    render: function () {
        return (
            <Input accept="image/*" onChange={this.handleChange} type="file" label={this.props.label} value={this.state.value} />
        );
    }
});

var AddRequestForm = React.createClass({
    getInitialState: function () {
        return {
            comment: null,
            email: null,
            image: null,
            name: null
        };
    },

    fieldChange: function (updates) {
        this.setState(updates);
    },

    render: function () {
        return (
            <form className="add-request-form" onSubmit={this.props.submitRequest}>
                <ImageInput onChangeCallback={this.fieldChange} label="Photo" />
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
