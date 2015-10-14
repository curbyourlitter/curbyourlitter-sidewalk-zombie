import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

import { NavHeader } from './NavHeader.jsx';

export var List = React.createClass({
    render: function () {
        return (
            <div>
                <NavHeader/>
                <div className="list">
                </div>
            </div>
        );
    }
});
