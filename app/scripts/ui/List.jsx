import _ from 'underscore';
import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

import { getCans, getCanColumnsData } from 'curbyourlitter-sql/lib/cans';
import { getReports, getReportColumnsData } from 'curbyourlitter-sql/lib/reports';
import { getRequests, getRequestColumnsData } from 'curbyourlitter-sql/lib/requests';

import config from '../config/config';
import { CanListItem } from './Can.jsx';
import { NavHeader } from './NavHeader.jsx';
import { ReportListItem } from './Report.jsx';
import { RequestListItem } from './Request.jsx';

var loadingCans = false,
    loadingReports = false,
    loadingRequests = false;

export var List = React.createClass({
    getInitialState: function () {
        return {
            overlayShown: true
        }
    },

    hideOverlay: function () {
        this.setState({ overlayShown: false });
    },

    render: function () {
        var list = this.props.items.map(item => {
            if (item.type === 'can') {
                return <CanListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} />
            }
            if (item.type === 'report') {
                return <ReportListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} />
            }
            else if (item.type === 'request') {
                return <RequestListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} />
            }
        });
        return (
            <div className="list">
                { this.state.overlayShown ? <ListOverlay hide={this.hideOverlay} /> : '' }
                <NavHeader/>
                <div className="list-body">
                    <h2>
                        on the map (<span className="list-items-count">{this.props.items.length}</span>)
                    </h2>
                    <ul className="entity-list">
                        {list}
                    </ul>
                </div>
            </div>
        );
    }
});

var ListOverlay = React.createClass({
    handleListClick: function (e) {
        e.preventDefault();
        this.props.hide();
    },

    render: function () {
        return (
            <div className="list-overlay">
                <div className="list-overlay-body">
                    <div className="list-overlay-body-header">map the trash</div>
                    <Link className="btn btn-block btn-default btn-add" to="/add">Do you see litter?</Link>
                    <Button block onClick={this.handleListClick}>View Data List</Button>
                    <div className="list-overlay-desktop">
                        <div><strong>Desktop Version</strong></div>
                        <div>Visit the site on your computer and check out a more detailed view of the map data.</div>
                    </div>
                </div>
            </div>
        );
    }
});

export var ListContainer = React.createClass({
    getInitialState: function () {
        return {
            canRows: [],
            reportRows: [],
            requestRows: [],
            rows: []
        };
    },

    getData: function () {
        var bboxFilters = { bbox: config.bbox },
            canFilters = _.extend({}, bboxFilters),
            reportFilters = _.extend({}, bboxFilters, config.reportFilters),
            requestFilters = _.extend({}, bboxFilters, config.requestFilters);

        this.loadCans(canFilters);
        this.loadReports(reportFilters);
        this.loadRequests(requestFilters);
    },

    loadCans: function (filters) {
        getCans(filters, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.reportRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ canRows: data });
                this.forceUpdate();
            }
        }, getCanColumnsData(config), config);
    },

    loadReports: function (filters) {
        getReports(filters, null, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.canRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ reportRows: data });
                this.forceUpdate();
            }
        }, getReportColumnsData(config), config);
    },

    loadRequests: function (filters) {
        getRequests(filters, null, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.canRows, ...this.state.reportRows);
                this.setRows(rows);
                this.setState({ requestRows: data });
                this.forceUpdate();
            }
        }, getRequestColumnsData(config), config);
    },

    componentDidMount: function () {
        this.getData();
    },

    setRows: function (rows) {
        // Subtract 180 degrees if in bbox to make items in view show up first for sure
        this.setState({ rows: _.sortBy(rows, row => {
            return row.center_distance;
        })});
    },

    render: function () {
        return <List items={this.state.rows}/>
    }
});
