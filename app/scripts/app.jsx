import React from 'react';
import ReactAnalytics from 'ga-react-router';
import ReactDOM from 'react-dom';
import { combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';

import * as reducers from './reducers';
import { AddRequest } from './ui/AddRequest.jsx';
import { Can } from './ui/Can.jsx';
import { ListContainer } from './ui/List.jsx';
import { Report } from './ui/Report.jsx';
import { Request } from './ui/Request.jsx';
import { Success } from './ui/Success.jsx';

var history = createHistory();
let store = createStore(combineReducers(reducers));
var mountNode = document.getElementById("app");

var triggerGA = function () {
    ReactAnalytics({ path: location.pathname });
};

ReactDOM.render((
    <Provider store={store}>
        <Router history={history} onUpdate={triggerGA}>
            <Route path="/" component={ListContainer}/>
            <Route path="/add" component={AddRequest}/>
            <Route path="/success" component={Success}/>
            <Route path="cans/:id" component={Can}/>
            <Route path="reports/:id" component={Report}/>
            <Route path="requests/:id" component={Request}/>
        </Router>
    </Provider>
    ), mountNode
);
