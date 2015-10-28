import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import { getCanColumnsDetails } from 'curbyourlitter-sql/lib/cans';

import config from '../config/config';
import { NavHeader } from './NavHeader.jsx';
import { DetailPanelHeader, detailPanel } from './Panel.jsx';

export var slugifyCanType = function (canType) {
        return canType.replace(/ /g, '-').toLowerCase();
};

export var Can = detailPanel(React.createClass({
    render: function () {
        var iconClasses = 'detail-panel-icon detail-panel-can-icon';
        return (
            <div>
                <NavHeader/>
                <div className="detail-panel-can">
                    <DetailPanelHeader iconClasses={iconClasses} text="Existing Bin" />
                    <div className="detail-panel-body">
                        <div className="detail-panel-row">
                            <label>Type</label>
                            <div>{this.props.cantype}</div>
                        </div>
                        {(() => {
                            if (this.props.can_location) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>Location</label>
                                        <div>{this.props.can_location}</div>
                                    </div>
                                );
                            }
                        })()}
                        {(() => {
                            if (this.props.maintained_by) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>Maintained By</label>
                                        <div>{this.props.maintained_by}</div>
                                    </div>
                                );
                            }
                        })()}
                        {(() => {
                            if (this.props.pick_up_schedule) {
                                return (
                                    <div className="detail-panel-row">
                                        <label>Pick-up Schedule</label>
                                        <div>{this.props.pick_up_schedule}</div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
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
        return (
            <li className={itemClasses} onClick={this.handleClick}>
                <Grid>
                    <Row>
                        <Col className="can-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="can-list-item-type">Existing Bin</div>
                            <div className="can-list-item-location">
                                {this.props.can_location ? this.props.can_location : ''}
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
});
