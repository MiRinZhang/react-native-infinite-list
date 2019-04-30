# react-native-infinite-flat-list
A high performance list component

### Install

`yarn add react-native-infinite-flat-list`

### Usage

> Just replace `FlatList` with `InfiniteListView`

*Replace this*

```javascript
render() {
  return (
    <FlatList
        data={[{text: 'react', version: '^16.8.6'},{text: 'react-native', version: '^0.59.5'}]}
        renderItem={ ({item}) => <View>{item.name}</View>}
    />
...
```

*With this*

```javascript
import { InfiniteListView } from 'react-native-infinite-flat-list'

render() {
  return (
    <InfiniteListView
        dataSource={[{text: 'react', version: '^16.8.6'},{text: 'react-native', version: '^0.59.5'}]}
        renderItem={ ({item}) => <View>{item.name}</View>}
        itemHeight={80}
    />
...
```