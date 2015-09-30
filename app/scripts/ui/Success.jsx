import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

export var Success = React.createClass({
    render: function () {
        return (
            <div>
                <header>
                    <h1>Success!</h1>
                    <Link to="/" className="cancel">Done</Link>
                </header>
                <div className="success">
                    <div className="thanks">Thanks!</div>
                    <p>Your image has been added!</p>
                    <p>Visit curbyourlitter.org on a desktop computer to see it on the map!</p>
                </div>
            </div>
        );
    }
});
