import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

export var Success = React.createClass({
    render: function () {
        return (
            <div className="success">
                <h1>Thank you!</h1>
                <p>Your image has been added!</p>
                <p>Visit curbyourlitter.org on a desktop to see the map!</p>
                <Link to="/" className="btn btn-default btn-block">Done</Link>
            </div>
        );
    }
});
