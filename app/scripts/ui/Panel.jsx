import _ from 'underscore';
import React from 'react';
import { Link } from 'react-router';

import { execute } from 'curbyourlitter-sql/lib/execute';

import config from '../config/config';

export var Panel = React.createClass({
    render: function () {
        var className = 'panel';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div className={className}>
                <div className="panel-header">
                    <Link to="/" aria-label="close" className="panel-close">&lt; back to list</Link>
                </div>
                <div className="panel-body" onScroll={this.props.onBodyScroll}>
                    {this.props.children}
                </div>
            </div>
        );
    }
});

export var DetailPanelHeader = React.createClass({
    getInitialState: function () {
        return {
            wrapped: false
        }
    },

    componentDidMount: function () {
        // Attempt to tell when the text wraps in order to reduce margin
        setTimeout(() => {
            if (this.refs.detailHeaderText.offsetHeight > 35) {
                this.setState({ wrapped: true });
            }
        }, 200);
    },

    render: function () {
        var textWrapperClasses = 'detail-panel-header-text-wrapper';
        if (this.state.wrapped) {
            textWrapperClasses += ' wrapped';
        }
        return (
            <h2 className="detail-panel-header">
                <span className={this.props.iconClasses}></span>
                <span className={textWrapperClasses}>
                    <span className="detail-panel-header-text" ref="detailHeaderText">
                        {this.props.text}
                    </span>
                </span>
                <span className="clearfix"></span>
            </h2>
        );
    }
});

export var detailPanel = function (Component, table, columns, className = 'detail-panel', sqlFunction) {
    return React.createClass({
        getData: function (id, callback) {
            var detailsSql = `SELECT ${columns.join(',')} FROM ${table} WHERE cartodb_id = ${id}`;
            if (sqlFunction) {
                detailsSql = sqlFunction(id, config);
            }
            execute(detailsSql, config.cartodbUser, callback);
        },

        updateData: function (id) {
            this.getData(id, data => this.setState(data[0]));
        },

        componentDidMount: function () {
            this.updateData(this.props.routeParams.id);
        },

        getInitialState: function () {
            return {};
        },

        render: function () {
            var innerHeader = (
                <h2>
                    <Link to="/list/">&lt; list</Link>
                </h2>
            );
            return (
                <Panel className={className} innerHeader={innerHeader}>
                    <Component {...this.props} {...this.state} />
                </Panel>
            );
        }
    });
};

export default Panel;
