import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import { getCanColumnsDetails } from 'curbyourlitter-sql/lib/cans';

import config from '../config/config';
import { detailPanel } from './Panel.jsx';

export var slugifyCanType = function (canType) {
        return canType.replace(/ /g, '-').toLowerCase();
};

export var Can = detailPanel(React.createClass({
    render: function () {
        var iconClasses = 'detail-panel-can-icon';
        if (this.props.complaint_type) {
            iconClasses += ` detail-panel-can-icon-${slugifyCanType(this.props.cantype)}`;
        }
        return (
            <div className="detail-panel-can">
                <h2>
                    <span className={iconClasses}></span>
                    <span className="detail-panel-can-header">Existing Bin</span>
                    <span className="clearfix"></span>
                </h2>
                <div className="detail-panel-row">
                    <label>Type</label>
                    <div>{this.props.cantype}</div>
                </div>
            </div>
        );
    }
}), config.tables.can, getCanColumnsDetails(config));

export var CanListItem = React.createClass({
    mixins: [History],

    handleClick: function () {
        this.history.pushState(null, `/cans/${this.props.id}`);
    },

    render: function () {
        var itemClasses = 'can-list-item entity-list-item',
            iconClasses = 'entity-list-item-icon can-list-item-icon';
        if (this.props.complaint_type) {
            iconClasses += ` can-list-item-icon-${slugifyCanType(this.props.type)}`;
        }
        return (
            <li className={itemClasses} onClick={this.handleClick}>
                <Grid>
                    <Row>
                        <Col className="can-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="can-list-item-type">Existing Bin</div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
});
