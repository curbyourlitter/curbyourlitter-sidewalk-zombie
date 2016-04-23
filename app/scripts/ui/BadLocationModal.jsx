import React from 'react';

export var BadLocationModal = React.createClass({
    render: function () {
        return (
            this.props.show ?
                (
                    <div className="bad-location-modal-wrapper">
                        <div className="bad-location-modal-content">
                            <h2 className="bad-location-modal-header">Are you in greenpoint?</h2>
                            <p>Can't display photos from other neighborhoods.</p>
                            <button className="btn btn-default" onClick={this.props.onDismiss}>Enter a Greenpoint address</button>
                        </div>
                    </div>
                )
            : null
        );
    }
});
