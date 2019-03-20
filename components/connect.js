import * as React from "react"
import hoistNonReactStatics from 'hoist-non-react-statics';
import type {ConnectItemType} from "./Types";

function getDisplayName(component, defaultValue = "Component") {
    return component.displayName || component.name || defaultValue;
}

export default function (...args: Array<ConnectItemType>): React.Component {

    let initialProps = {};
    let preValues = [];
    args.forEach((item: ConnectItemType, index: number) => {
        const values = item.scope.multiGet(item.keys).map(([key, value]) => value);
        preValues[index] = values;
        initialProps = Object.assign({}, initialProps, item.mapStateToProps(values));
    });

    type State = {
        nextProps: Object
    };

    return function (WrapperComponent) {
        class StorageConnection extends React.PureComponent<any, State> {
            constructor(props) {
                super(props);
                this._listeners = [];
                this._values = [];
                this._mounted = false;
                this.state = {
                    nextProps: initialProps
                };
            }

            _subscribe() {
                args.forEach((item: ConnectItemType, index: number) => {
                    this._listeners = this._listeners.concat(
                        item.keys.map((key, keyIndex) => {
                            return item.scope.addListener(key, value => {
                                preValues[index][keyIndex] = value;
                                const newProps = Object.assign({}, this.state.props, item.mapStateToProps(preValues[index]));
                                if (this._mounted) {
                                    this.setState({nextProps: newProps});
                                }
                            })
                        })
                    )
                })
            }

            _unsubscribe() {
                this._listeners.forEach(listener => listener.remove());
            }

            render() {
                const {forwardedRef, ...rest} = this.props;
                return <WrapperComponent {...rest}
                                         {...this.state.nextProps}
                                         ref={forwardedRef}></WrapperComponent>
            }

            componentDidMount() {
                this._mounted = true;
                this._subscribe();
            }

            componentWillUnmount() {
                this._mounted = false;
                this._unsubscribe();
            }
        }

        const StorageConnectionWrapper = React.forwardRef((props, ref) => {
            return <StorageConnection {...props} forwardedRef={ref}/>
        });

        StorageConnectionWrapper.displayName = getDisplayName(WrapperComponent);

        hoistNonReactStatics(StorageConnectionWrapper, WrapperComponent);

        return StorageConnectionWrapper;
    }
}