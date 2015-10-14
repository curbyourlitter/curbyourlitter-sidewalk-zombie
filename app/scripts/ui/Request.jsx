import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import { getRequestColumnsDetails } from 'curbyourlitter-sql/lib/requests';

import config from '../config/config';
import { NavHeader } from './NavHeader.jsx';
import { detailPanel } from './Panel.jsx';

export var Request = detailPanel(React.createClass({
    getInitialState: function () {
        return {};
    },

    getSubtypeDisplay: function() {
        if (this.props.can_type) {
            var match = _.findWhere(config.bintypes[this.props.can_type].subtypes, { label: this.props.can_subtype });
            if (match) {
                return match.display;
            }
        }
        return '';
    },

    render: function () {
        var iconClasses = 'detail-panel-icon detail-panel-request-icon';
        if (!this.props.can_type) {
            iconClasses += ' detail-panel-request-icon-litter-sighting';
        }
        return (
            <div>
                <NavHeader/>
                <div className="detail-panel-request">
                    {this.props.image ? <img src={this.props.image} /> : ''}
                    <h2 className="detail-panel-header">
                        <span className={iconClasses}></span>
                        <span className="detail-panel-request-header">
                            {this.props.can_type ? `${this.props.can_type} bin request` : 'litter sighting'}
                        </span>
                        <span className="clearfix"></span>
                    </h2>
                    <div className="detail-panel-body">
                        {(() => {
                            if (this.props.can_type) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>type</label>
                                        <div>{this.getSubtypeDisplay()}</div>
                                    </div>
                                );
                            }
                        })()}
                        <div className="detail-panel-row">
                            <label>{ this.props.can_type ? 'requested' : 'taken' }</label>
                            <div>{moment(this.props.date).format('MMMM D, YYYY')}</div>
                        </div>
                        {(() => {
                            if (this.props.comment) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>comment</label>
                                        <div>{this.props.comment}</div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            </div>
        );
    }
}), config.tables.request, getRequestColumnsDetails(config));

export var RequestListItem = React.createClass({
    mixins: [History],

    handleClick: function () {
        this.history.pushState(null, `/requests/${this.props.id}`);
    },

    render: function () {
        var iconClasses = 'entity-list-item-icon request-list-item-icon',
            itemClasses = 'request-list-item entity-list-item';
        if (!this.props.can_type) {
            iconClasses += ' request-list-item-icon-litter-sighting';
            itemClasses += ' request-list-item-litter-sighting';
        }
        return (
            <li className={itemClasses} onClick={this.handleClick}>
                <Grid>
                    <Row>
                        <Col className="request-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="request-list-item-can-type">
                                {this.props.can_type ? `${this.props.can_type} bin request` : 'litter sighting'}
                            </div>
                            <div className="request-list-item-date">
                                {moment(this.props.date).format('h:mma MMMM Do YYYY')}
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
});
