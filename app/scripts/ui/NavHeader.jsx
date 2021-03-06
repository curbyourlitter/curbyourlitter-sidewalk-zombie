import React from 'react';
import { Nav, NavBrand, Navbar, NavItem } from 'react-bootstrap';
import { Link } from 'react-router';

export var NavHeader = React.createClass({
    render: function () {
        return (
            <header className="nav-header">
                <Link to="/" className="navbar-brand"></Link>
                <Navbar fixedTop toggleNavKey={0}>
                    <Nav eventKey={0}>
                        <NavItem href="http://curbyourlitter.org/the-problem/">The Problem</NavItem>
                        <NavItem href="http://curbyourlitter.org/what-can-we-do/">What Can We Do?</NavItem>
                        <NavItem href="http://curbyourlitter.org/news-events/">News &amp; Events</NavItem>
                        <NavItem href="http://curbyourlitter.org/about/">About</NavItem>
                        <NavItem className="navbar-map-link" href="/">Map the Trash!</NavItem>
                    </Nav>
                </Navbar>
            </header>
        );
    }
});
