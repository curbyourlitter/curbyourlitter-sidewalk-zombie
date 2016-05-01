import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import { getReportColumnsDetails, getReportSqlDetails } from 'curbyourlitter-sql/lib/reports';

import config from '../config/config';
import { getStaticMapUrl } from '../services/Mapbox.jsx';
import { NavHeader } from './NavHeader.jsx';
import { DetailPanelHeader, detailPanel } from './Panel.jsx';

export var slugifyComplaintType = function (complaintType) {
        return complaintType.replace(/ /g, '-').toLowerCase();
};

export var Report = detailPanel(React.createClass({
    getMapUrl: function () {
        if (!(this.props.longitude && this.props.latitude)) return;
        return getStaticMapUrl({
            latitude: this.props.latitude,
            longitude: this.props.longitude,
            type: 'report'
        });
    },

    render: function () {
        var iconClasses = 'detail-panel-icon detail-panel-report-icon';
        if (this.props.complaint_type) {
            iconClasses += ` detail-panel-report-icon-${slugifyComplaintType(this.props.complaint_type)}`;
        }
        return (
            <div>
                <NavHeader/>
                <div className="detail-panel-report">
                    <DetailPanelHeader iconClasses={iconClasses} text={this.props.complaint_type} />
                    <div className="detail-panel-body">
                        <div className="detail-panel-row">
                            <label>Complaint Type</label>
                            <div>
                                <p>{this.props.descriptor}</p>
                                {(() => {
                                    if (this.props.description) {
                                        return <p>{this.props.description}</p>;
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="detail-panel-row">
                            <label>Reported</label>
                            <div>{moment(this.props.date).format('MMMM D, YYYY')}</div>
                        </div>
                        {(() => {
                            if (this.props.incident_address) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>Location</label>
                                        <div>{this.props.incident_address}</div>
                                    </div>
                                );
                            }
                            else if (this.props.intersection_street1 && this.props.intersection_street2) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>Location</label>
                                        <div>{this.props.intersection_street1} &amp; {this.props.intersection_street2}</div>
                                    </div>
                                );
                            }
                        })()}
                        <div className="detail-panel-map">
                            <img src={this.getMapUrl()} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}), config.tables.report, getReportColumnsDetails(config), 'detail-panel', getReportSqlDetails);

export var ReportListItem = React.createClass({
    mixins: [History],

    handleClick: function () {
        this.history.pushState(null, `/reports/${this.props.id}`);
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return (nextProps.in_bbox !== this.props.in_bbox);
    },

    render: function () {
        var itemClasses = 'report-list-item entity-list-item',
            iconClasses = 'entity-list-item-icon report-list-item-icon';
        if (this.props.complaint_type) {
            iconClasses += ` report-list-item-icon-${slugifyComplaintType(this.props.complaint_type)}`;
        }
        if (this.props.in_bbox) {
            itemClasses += ' in-view';
        }
        return (
            <li className={itemClasses} onClick={this.handleClick}>
                <Grid>
                    <Row>
                        <Col className="report-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="report-list-item-date">
                                {moment(this.props.date).format('MMMM D, YYYY')}
                            </div>
                            <div className="report-list-item-complaint">{this.props.complaint_type}</div>
                            <div className="report-list-item-address">{
                                this.props.incident_address ?
                                this.props.incident_address :
                                `${this.props.intersection_street1} & ${this.props.intersection_street2}`
                            }</div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
});
