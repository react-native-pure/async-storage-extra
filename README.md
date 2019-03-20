# async-storage-extra

AsyncStorage扩展,所有AsyncStorage中的数据都可以同步进行读写,同时数据也会被持久化.可以监听每个key的变化

[![Build Status](https://travis-ci.org/react-native-pure/async-storage-extra.svg?branch=master)](https://travis-ci.org/react-native-pure/async-storage-extra)
[![Coverage Status](https://coveralls.io/repos/github/react-native-pure/async-storage-extra/badge.svg?branch=master)](https://coveralls.io/github/react-native-pure/async-storage-extra?branch=master)

## Install

```bash
$ npm i @react-native-pure/async-storage-extra --save
```

## Simple Usage

```
import Storage from "@react-native-pure/async-storage-extra

const User=new Storage("@user");

User.setItem("name","Mr");
User.setItem("age",10);
User.setItem("birthday",new Date());
User.setItem("other",{});

```

## 绑定Storage中的数据到Component

```
import * as React from "react"
import {View,Text} from "react-native"
import {storage} from "@react-native-pure/async-storage-extra

@storage(
    User.connect(["name","age"],([name,age])=>({name,age}))
)
class User extends React.Component{
    render(){
        return (
            <View>
                <Text>Name : {this.props.name}</Text>
                <Text>Age : {this.props.age}</Text>
            </View>
        );
    }
}

```

### Storage

默认情况下,在初始化Storage时会自动从AsyncStorage中恢复数据,数据恢复完成会触发`onPreload`事件.

PS:当使用setItem,multiSet设置的数据和存在的数据一样时(DeepEqual),将不会触发任何事件和写操作.

- `constructor` **(option:string|[StorageOption](#storageoption)={prefix:"@storage",preload:true})=>void**
- `getItem` **(key:string)=>any**
- `multiGet` **(keys:Array<string>)=>Array<[key,value]>**
- `search` **(pattern:RegExp)=>Array<[key,value]>**
- `setItem` **(key:string,value:any)=>void**
- `multiSet` **(keyValuePairs:Array<[key,value]>)=>void**
- `removeItem` **(key:string)=>void**
- `multiRemove` **(keys:Array<string>)=>void**
- `clear` **()=>void**
- `getAllKeys` **()=>Array<string>**
- `getKeys` **(pattern:RegExp)=>Array<string>**
- `addListener` **(key:string,callback:(value:any)=>void)=>Object**
- `once` **(key:string,callback:(value:any)=>void)=>Object**
- `removeAllListeners` **(key:string)=>void**
- `connect` **(keys:Array<string>,mapStateToProps:(Array)=>Object)=>void**
- `restore` **()=>void** 从AsyncStorage中恢复数据
- `release` **()=>void** 释放内存,Storage中的数据将不可用

### StorageOption

- `prefix` **string**
- `preload` **boolean**
- `onPreload` **(self:[Storage](#storage))=>void**