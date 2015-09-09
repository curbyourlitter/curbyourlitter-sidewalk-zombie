import React from 'react';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';

import { AddRequest } from './ui/AddRequest.jsx';

var history = createHistory();
var mountNode = document.getElementById("app");

React.render((
        <Router history={history}>
            <Route path="/" component={AddRequest}/>
        </Router>
    ), mountNode
);
