import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import ListItem from './ListItem';
import { LoadMoreStatus } from './constants';
import { createNumList, diffListItem, noop } from './utils';

export default class InfiniteListView extends PureComponent {
    _isLoading = false;
    _isScrolled = false;
    _offsetY = 0;
    _listRef = null;

    static propTypes = {
        pushToLoadMoreTitle: PropTypes.string,
        loadingTitle: PropTypes.string,
        noMoreDataTitle: PropTypes.string,
        isShowLoadMore: PropTypes.bool,
        initialListSize: PropTypes.number,
        textColor: PropTypes.string,
        onViewItemsChanged: PropTypes.func,
        dataSource: PropTypes.array.isRequired,
        setRef: PropTypes.func,
        renderRow: PropTypes.func.isRequired,
        onLoadMore: PropTypes.func,
        onEndReached: PropTypes.func,
        onScroll: PropTypes.func,
        itemHeight: PropTypes.number.isRequired,
        renderFooter: PropTypes.func,
        customLoadMoreView: PropTypes.func
    };

    static defaultProps = {
        pushToLoadMoreTitle: '上拉加载更多…',
        loadingTitle: '努力加载中…',
        noMoreDataTitle: '已经加载到底啦…',
        isShowLoadMore: true,
        initialListSize: 6,
        textColor: '#9E9E9E',
        onViewItemsChanged: noop,
        dataSource: [],
        setRef: null,
        renderRow: noop,
        onLoadMore: null,
        onEndReached: null,
        onScroll: null,
        itemHeight: 80,
        renderFooter: null,
        customLoadMoreView: null
    };

    constructor(props) {
        super(props);

        this.state = {
            loadStatus: LoadMoreStatus.finish
        };

        this.currentShowItems = createNumList(props.initialListSize);

        this.rowRefs = {};
    }

    componentDidUpdate() {
        if (!this._isScrolled) {
            const { onViewItemsChanged } = this.props,
                showItems = [...this.currentShowItems];

            onViewItemsChanged && onViewItemsChanged({
                viewableItems: showItems,
                changed: showItems
            });
        }
    }

    componentWillUnmount() {
        this._isLoading = false;
        this._isScrolled = false;
        this._offsetY = 0;
        this._visibleSwap = [];
        this._listRef = null;
        this.timer && clearTimeout(this.timer);
    }

    render() {
        const { dataSource } = this.props;

        return (
            <FlatList
                ref={this._setRef}
                data={dataSource}
                renderItem={this._renderItem}
                onEndReached={this._onEndReached}
                ListFooterComponent={this._renderFooter()}
                {...this.props}
                onScroll={this._onScroll}
            />
        );
    }

    _setRef = ref => {
        const { setRef } = this.props;

        this._listRef = ref;
        setRef && setRef(ref);
    };

    _renderItem = data => {
        const { renderRow } = this.props;

        if (!renderRow) {
            console.warn('renderRow is undefined or null!');
            return null;
        }


        return (
            <ListItem
                ref={ref => this._addRowRefs(ref, data)}
                viewComponent={renderRow(data)}
            />
        );
    };

    _addRowRefs(ref, data) {
        const { index, item } = data;

        this.rowRefs[index] = {
            ref,
            index,
            item
        };
    }

    _updateItem = (index, visibility) => {
        if (!this.rowRefs[index] || !this.rowRefs[index].ref) {
            return false;
        }

        this.rowRefs[index].ref.setVisibility(visibility);

        return visibility;
    };

    _onEndReached = event => {
        const { loadStatus } = this.state,
            { isShowLoadMore, onLoadMore, onEndReached } = this.props;

        if (loadStatus === LoadMoreStatus.noMoreData || this._isLoading || !isShowLoadMore) {
            return null;
        }

        this._isLoading = true;
        this.setState({ loadStatus: LoadMoreStatus.loading });

        this.timer = setTimeout(() => {
            if (onLoadMore) {
                onLoadMore(isNoMoreData => {
                    this._isLoading = false;
                    this.setState({ loadStatus: isNoMoreData ? LoadMoreStatus.noMoreData : LoadMoreStatus.finish });
                })
            }
        }, 500);

        onEndReached && onEndReached(event);
    };

    _onScroll = e => {
        const { onScroll, itemHeight, onViewItemsChanged } = this.props,
            { contentOffset } = e.nativeEvent,
            { y: offsetY } = contentOffset,
            hideNum = Math.floor(offsetY / itemHeight);

        if (hideNum >= 0) {
            if (!this._isScrolled) {
                this._isScrolled = true;
            }

            const { newList, diff, diffIndex } = diffListItem(hideNum, this.currentShowItems),
                prevStr = this.currentShowItems.join('_'),
                nextStr = newList.join('_'),
                changed = prevStr !== nextStr;

            if (changed) {
                this.currentShowItems = [...newList];

                diff.forEach(item => this._updateItem(item.index, item.visible));

                onViewItemsChanged && onViewItemsChanged({
                    viewableItems: [...newList],
                    changed: [...diffIndex]
                });
            }
        }

        onScroll && onScroll(e);
    };

    _renderFooter = () => {
        const {
            textColor, isShowLoadMore,
            renderFooter, customLoadMoreView,
            noMoreDataTitle, pushToLoadMoreTitle,
            loadingTitle
        } = this.props,
            { loadStatus } = this.state;

        if (!isShowLoadMore) {
            return renderFooter ? renderFooter() : <View style={{ height: 0.5 }} />;
        }

        if (customLoadMoreView) {
            return (
                <View>
                    {renderFooter ? renderFooter() : null}
                    {customLoadMoreView(loadStatus)}
                </View>
            )
        }

        switch (loadStatus) {
            case LoadMoreStatus.noMoreData:
                return (
                    <View>
                        {renderFooter ? renderFooter() : null}
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: textColor }]}>{noMoreDataTitle}</Text>
                        </View>
                    </View>
                );
            case LoadMoreStatus.finish:
                return (
                    <View>
                        {renderFooter ? renderFooter() : null}
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: textColor }]}>{pushToLoadMoreTitle}</Text>
                        </View>
                    </View>
                );
            case LoadMoreStatus.finish:
                return (
                    <View>
                        {renderFooter ? renderFooter() : null}
                        <View style={styles.footer}>
                            <ActivityIndicator color={textColor} />
                            <Text style={[styles.footerText, { color: textColor }]}>{loadingTitle}</Text>
                        </View>
                    </View>
                );
        }
    };

    endLoadMore = isNoMoreData => {
        this._isLoading = false;

        this.setState({
            loadStatus: isNoMoreData ? LoadMoreStatus.noMoreData : LoadMoreStatus.finish
        });
    };

    resetStatus = () => {
        this.setState({
            loadStatus: LoadMoreStatus.finish
        });
    };

    scrollToOffset = (params) => {
        this._listRef && this._listRef.scrollToOffset(params);
    };

    scrollToItem = (params) => {
        this._listRef && this._listRef.scrollToItem(params);
    };

    scrollToIndex = (params) => {
        this._listRef && this._listRef.scrollToIndex(params);
    };

    scrollToEnd = (params) => {
        this._listRef && this._listRef.scrollToEnd(params);
    };

    scrollToTop = (params) => {
        this._listRef && this._listRef.scrollToTop(params);
    };
}


const styles = StyleSheet.create({
    footer: {
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerText: {
        fontSize: 13,
        color: 'white',
        marginLeft: 10,
        backgroundColor: 'transparent'
    }
});