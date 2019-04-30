import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native';

export default class ListItem extends PureComponent {
    static propTypes = {
        viewComponent: PropTypes.element.isRequired
    };

    static defaultProps = {
        viewComponent: null
    };

    constructor(props) {
        super(props);

        this.state = {
            visibility: true
        };

        this.viewProperties = {
            width: 0,
            height: 0
        };
    }

    render() {
        if (!this.state.visibility) {
            const { width, height } = this.viewProperties;
            return <View style={{ width, height }} />;
        }

        return (
            <View onLayout={this._onLayout}>
                {this.props.viewComponent}
            </View>
        );
    }

    _onLayout = e => {
        const { height, width } = e.nativeEvent.layout;

        this.viewProperties = {
            height,
            width
        };
    };

    setVisibility = visibility => {
        if (visibility !== this.state.visibility) {
            this.setState({ visibility });
        }
    };
}