import React from 'react';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';

import { AddRequest } from './ui/AddRequest.jsx';
import { ListContainer } from './ui/List.jsx';
import { Success } from './ui/Success.jsx';

var history = createHistory();
var mountNode = document.getElementById("app");

React.render((
        <Router history={history}>
            <Route path="/" component={ListContainer}/>
            <Route path="/add" component={AddRequest}/>
            <Route path="/success" component={Success}/>
        </Router>
    ), mountNode
);
