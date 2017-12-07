import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import { Button, Col, Grid, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { getCans, getCanColumnsData } from 'curbyourlitter-sql/lib/cans';
import { getReports, getReportColumnsData } from 'curbyourlitter-sql/lib/reports';
import { getRequests, getRequestColumnsData } from 'curbyourlitter-sql/lib/requests';

import {
    filtersClear,
    communityInputUpdate,
    reportsUpdate,
    yearStartUpdate,
    yearEndUpdate
} from '../actions';
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
            overlayShown: !window.overlayHidden
        }
    },

    hideOverlay: function () {
        this.setState({ overlayShown: false });
    },

    getYears: function () {
        let years = [];
        const minYear = 2010;
        const maxYear = new Date().getFullYear();
        for (let i = minYear; i <= maxYear; i++) {
            years.push(i);
        }
        return years;
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
                <ListFilters years={this.getYears()} {...this.props} />
                <div className="list-body">
                    <h2>
                        on the map (<span className="list-items-count">{this.props.items.length}</span>)
                    </h2>
                    <ul className="entity-list">
                        {list}
                    </ul>
                </div>
                <Link className="list-add-button" to="/add">
                    <img src="/images/add.png" />
                </Link>
            </div>
        );
    }
});

var ListFilters = React.createClass({
    getInitialState: function () {
        return {
            expanded: false
        }
    },

    handleFiltersButtonClicked: function () {
        this.setState({ expanded: !this.state.expanded });
    },

    handleResetButtonClicked: function () {
        this.props.onReset();
    },

    render: function () {
        return (
            <div className="list-filters">
                <div className="list-filters-header">
                    <div className="list-filters-button" onClick={this.handleFiltersButtonClicked}>filters</div>
                    <div className="list-filters-button list-filters-button-reset" onClick={this.handleResetButtonClicked}>reset</div>
                    <div style={{ clear: 'both' }}></div>
                </div>
                { this.state.expanded ?  this.renderFilters() : null }
            </div>
        );
    },

    renderFilters: function () {
        return (
            <div className="list-filters-body">
                <Grid>
                    <Row>
                        <Col xs={4}>
                            <select className="list-filters-start" onChange={e => this.props.onYearStartChange(e.target.value)} value={this.props.yearStart}>
                                { this.props.years.map(year => <option value={year} key={year}>{year}</option>) }
                            </select>
                        </Col>
                        <Col xs={4}>
                            <span className="list-filters-date-separator">to</span>
                        </Col>
                        <Col xs={4}>
                            <select className="list-filters-end" onChange={e => this.props.onYearEndChange(e.target.value)} value={this.props.yearEnd}>
                                { this.props.years.map(year => <option value={year} key={year}>{year}</option>) }
                            </select>
                        </Col>
                    </Row>
                    <Row>
                        <select className="list-filters-community-input" onChange={e => this.props.onCommunityInputChange(e.target.value)} value={this.props.communityInput}>
                            <option>All Community Input</option>
                            <option value="">Litter Sightings</option>
                            <option>No Community Input</option>
                        </select>
                    </Row>
                    <Row>
                        <select className="list-filters-311" onChange={e => this.props.onReportsChange(e.target.value)} value={this.props.reports}>
                            <option>All 311 Data</option>
                            <option>Sanitation Condition</option>
                            <option>Overflowing Litter Bin</option>
                            <option>Dirty Condition</option>
                            <option>No 311 Data</option>
                        </select>
                    </Row>
                </Grid>
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
                    <Link className="btn btn-block btn-default btn-add" to="/add">
                        <span className="list-overlay-btn-text">Do you see litter?</span>
                        <span className="list-overlay-icon list-overlay-add-icon"></span>
                        <div className="clearfix"></div>
                    </Link>
                    <Button block onClick={this.handleListClick}>
                        <span className="list-overlay-btn-text">View Data List</span>
                        <span className="list-overlay-icon list-overlay-list-icon"></span>
                        <div className="clearfix"></div>
                    </Button>
                    <div className="list-overlay-desktop">
                        <div className="list-overlay-desktop-header">Desktop Version</div>
                        <div className="list-overlay-desktop-body">Visit the site on your computer and check out a more detailed view of the map data.</div>
                    </div>
                </div>
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        communityInput: state.communityInput,
        reports: state.reports,
        yearStart: state.yearStart,
        yearEnd: state.yearEnd
    };
}

export var ListContainer = connect(mapStateToProps)(React.createClass({
    getInitialState: function () {
        return {
            canRows: [],
            reportRows: [],
            requestRows: [],
            rows: []
        };
    },

    handleFiltersReset: function () {
        this.props.dispatch(filtersClear());
    },

    handleCommunityInputChange: function (value) {
        this.props.dispatch(communityInputUpdate(value));
    },

    handleReportsChange: function (value) {
        this.props.dispatch(reportsUpdate(value));
    },

    handleYearStartChange: function (value) {
        value = parseInt(value);
        if (value <= this.props.yearEnd) {
            this.props.dispatch(yearStartUpdate(value));
            this.getData();
        }
    },

    handleYearEndChange: function (value) {
        value = parseInt(value);
        if (value >= this.props.yearStart) {
            this.props.dispatch(yearEndUpdate(value));
            this.getData();
        }
    },

    getFilteredItems: function () {
        let items = this.state.rows.filter(item => {
            if (item.date) {
                const year = moment(item.date, 'YYYY-MM-DD HH:mm:ss').year();
                if (!(year >= this.props.yearStart && year <= this.props.yearEnd)) {
                    return false;
                }
            }
            if (item.type === 'request') {
                if (this.props.communityInput === 'All Community Input') {
                    return true;
                }
                else if (this.props.communityInput === 'No Community Input') {
                    return false;
                }
                else {
                    return item.can_type === this.props.communityInput;
                }
            }
            if (item.type === 'report') {
                if (this.props.reports === 'All 311 Data') {
                    return true;
                }
                else if (this.props.reports === 'No 311 Data') {
                    return false;
                }
                else {
                    return item.complaint_type === this.props.reports;
                }
            }
            return true;
        });
        items = items.sort((a, b) => {
            if (!a.date && b.date) return 1;
            if (a.date && !b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
        return items;
    },

    getData: function () {
        var bboxFilters = { bbox: config.bbox },
            canFilters = _.extend({}, bboxFilters),
            reportFilters = _.extend({}, bboxFilters, config.reportFilters),
            requestFilters = _.extend({}, bboxFilters, config.requestFilters),
            yearRange = { start: this.props.yearStart, end: this.props.yearEnd };

        this.loadCans(canFilters);
        this.loadReports(reportFilters, yearRange);
        this.loadRequests(requestFilters, yearRange);
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

    loadReports: function (filters, yearRange) {
        getReports(filters, yearRange, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.canRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ reportRows: data });
                this.forceUpdate();
            }
        }, getReportColumnsData(config), config);
    },

    loadRequests: function (filters, yearRange) {
        getRequests(filters, yearRange, data => {
            if (this.isMounted()) {
                // Filter out requests, only show sightings
                var sightings = data.filter(row => row.can_type === null);
                var rows = [];
                rows.push(...sightings, ...this.state.canRows, ...this.state.reportRows);
                this.setRows(rows);
                this.setState({ requestRows: sightings });
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
        return <List
            onReset={this.handleFiltersReset}
            onCommunityInputChange={this.handleCommunityInputChange}
            onReportsChange={this.handleReportsChange}
            onYearStartChange={this.handleYearStartChange}
            onYearEndChange={this.handleYearEndChange}
            communityInput={this.props.communityInput}
            reports={this.props.reports}
            yearStart={this.props.yearStart}
            yearEnd={this.props.yearEnd}
            items={this.getFilteredItems()} />
    }
}));
