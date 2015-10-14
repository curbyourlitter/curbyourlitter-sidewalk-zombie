import React from 'react';
import { Nav, NavBrand, Navbar, NavItem } from 'react-bootstrap';

export var NavHeader = React.createClass({
    render: function () {
        return (
            <header className="nav-header">
                <div className="navbar-brand">
                    <div className="logo"></div>
                    <div className="brand-text">
                        <div className="brand">Curb Your Litter</div>
                        <div className="city">Greenpoint</div>
                    </div>
                </div>
                <Navbar fixedTop toggleNavKey={0}>
                    <Nav eventKey={0}>
                        <NavItem href="http://curbyourlitter.org/the-problem/">The Problem</NavItem>
                        <NavItem href="http://curbyourlitter.org/what-can-we-do/">What Can We Do?</NavItem>
                        <NavItem href="http://curbyourlitter.org/news-events/">News &amp; Events</NavItem>
                        <NavItem href="http://curbyourlitter.org/about/">About</NavItem>
                        <NavItem>Map the Trash!</NavItem>
                    </Nav>
                </Navbar>
            </header>
        );
    }
});
