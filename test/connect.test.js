jest.mock("react-native")
import "../__tests__/AsyncStorage.mock"
import * as React from "react"
import renderer from 'react-test-renderer';
import AsyncStorageExtra from "../components/AsyncStorageExtra";
import storage from "../components/connect"

describe("test AsyncStorage connect", () => {
    const key = "name";
    const value = "jean"
    const Storage = new AsyncStorageExtra("@test");
    Storage.setItem(key, value);

    class User extends React.Component {
        render() {
            return (
                <div>
                    <span>Name : {this.props.name}</span>
                </div>
            );
        }
    }

    const ConnectUser = storage(Storage.connect([key], ([name]) => {
        return {
            name
        }
    }))(User)

    test(`The correct display name is  in <User/>`, () => {
        const name = Storage.getItem(key);
        expect(name).toBe(value);
        const component = renderer.create(
            <ConnectUser/>
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
        Storage.setItem("name","jean.h.ma");
        tree=component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});