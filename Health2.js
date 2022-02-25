import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    FlatList
} from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import axios from 'axios';
import Toast from 'react-native-toast-message';


const GET_ALL_RECORD = 'https://d570ixfqvk.execute-api.ap-south-1.amazonaws.com/dev/record?userId='
const POST_RECORD = 'https://d570ixfqvk.execute-api.ap-south-1.amazonaws.com/dev/record'
const POST_ALL_RECORD = 'https://d570ixfqvk.execute-api.ap-south-1.amazonaws.com/dev/bulk-record'


export default class Health2 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newData: [],
            stepData: [],
            auth: '',
            userId: `user${Math.floor(Math.random() * 100)}`,
            // stepData: [
            //     {
            //         value: 5281,
            //         end: "2022-02-24T00:00:00.000Z",
            //         start: "2022-02-23T00:00:00.000Z",
            //         type: "STEP"
            //     },
            //     {
            //         value: 110,
            //         end: "2022-02-21T15:13:36.000Z",
            //         start: "2022-02-20T15:12:36.000Z",
            //         type: "STEPS"
            //     },
            //     {
            //         value: 130,
            //         end: "2022-02-22T15:13:36.000Z",
            //         start: "2022-02-21T15:12:36.000Z",
            //         type: "STEPS"
            //     },
            //     {
            //         value: 5700,
            //         end: "2022-02-24T00:00:00.000Z",
            //         start: "2022-02-24T00:00:00.000Z",
            //         type: "STEP"
            //     },
            //     {
            //         value: 6132,
            //         end: "2022-02-23T00:00:00.000Z",
            //         start: "2022-02-22T00:00:00.000Z",
            //         type: "STEP"
            //     }
            // ]
        };
    }
    componentDidMount() {
        const options = {
            scopes: [
                Scopes.FITNESS_ACTIVITY_READ,
                Scopes.FITNESS_ACTIVITY_WRITE,
                Scopes.FITNESS_BODY_READ,
                Scopes.FITNESS_BODY_WRITE,
                Scopes.FITNESS_BLOOD_PRESSURE_READ,
                Scopes.FITNESS_BLOOD_PRESSURE_WRITE,
                Scopes.FITNESS_BLOOD_GLUCOSE_READ,
                Scopes.FITNESS_BLOOD_GLUCOSE_WRITE,
                Scopes.FITNESS_NUTRITION_WRITE,
                Scopes.FITNESS_SLEEP_READ,
            ],
        };



        GoogleFit.checkIsAuthorized().then((d) => {
            var authorized = GoogleFit.isAuthorized;
            console.log('befor::', authorized);
            if (authorized) {
                // if already authorized, fetch data
            } else {
                // Authentication if already not authorized for a particular device
                GoogleFit.authorize(options)
                    .then(authResult => {
                        console.log('afterr::', authResult);
                        if (authResult.success) {
                            console.log('AUTH_SUCCESS');
                            this.setState({ auth: 'AUTH_SUCCESS' })
                            this.showToast('success', 'Authozied', 'GoogleFit is now connected! 🤩')
                        } else {
                            this.setState({ auth: 'AUTH_DENIED' })
                            this.showToast('error', 'Unauthozied', 'Try connecting GoogleFit again 😟 ')

                            console.log('AUTH_DENIED ' + authResult.message);
                        }
                    })
                    .catch((err) => {
                        console.log('AUTH_ERROR', err);
                    });
            }
        });

    }
    showToast = (type, text1, text2) => Toast.show({
        type,
        text1,
        text2
    });
    fetchData = async () => {

        var today = new Date();
        let lastWeekDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 8,
        );
        this.showToast('info', 'Fetching Data....')

        const response = await axios({
            method: 'get',
            url: `${GET_ALL_RECORD}${this.state.userId}`,
        });
        if (!!response && !!response.data && !!response.data.data) {
            this.showToast('success', 'Data Fetched', 'Data fetched from DynamoDB 🤩')
            const a = response.data.data.Items
            console.log('kkkkkkkkkkkkkkkkk', a)
            this.setState({ stepData: a })
            const b = a.reduce((a, b) => {
                return new Date(a.end.replace(' ', 'T')) > new Date(b.end.replace(' ', 'T')) ? a : b;
            });
            lastWeekDate = new Date(b.end.replace(' ', 'T'))

        }

        const opt = {
            startDate: lastWeekDate.toISOString(), // required ISO8601Timestamp
            // startDate: '2022-02-22T09:43:36', // required ISO8601Timestamp
            endDate: today.toISOString(), // required ISO8601Timestamp
            bucketUnit: 'DAY', // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
            bucketInterval: 1, // optional - default 1.
        };
        const res = await GoogleFit.getDailyStepCountSamples(opt);
        if (res.length !== 0) {
            this.showToast('success', 'Data Fetched', 'Data fetched from GoogleFit 🤩')
            for (var i = 0; i < res.length; i++) {
                // if (res[i].source === 'com.google.android.gms:estimated_steps') {
                //     let data = res[i].steps.reverse();
                //     dailyStepCount = res[i].steps;
                //     console.log('::::::::::::::::::::ssss', data)
                //     console.log('::::::::::::::::::::ssss', JSON.stringify(res))
                //     this.setState({ stepData: data })
                //     //   setdailySteps(data[0].value);
                // }
                if (res[i].source === 'com.google.android.gms:estimated_steps') {
                    let data = res[i].rawSteps.reverse();
            console.log('kkkkkkkkkkkkkkkkk', data)

                    data = data.map(item => ({
                        value: item.steps,
                        name: item.dataTypeName,
                        start: new Date(item.startDate).toISOString().split('T')[0],
                        end: new Date(item.endDate).toISOString().split('T')[0],
                    }))
                    // dailyStepCount = res[i].steps;
                    this.setState({ stepData: [...this.state.stepData, ...data], newData: data })

                    //   setdailySteps(data[0].value);
                }
            }
        } else {
            console.log('Not Found');
        }
    }
    sendData = () => {
        this.showToast('info', 'Sending Data...', 'Data is being sent to DynamoDB 🤩')

        axios.post(POST_ALL_RECORD, {
            records: this.state.newData.map(item => ({ ...item, type: 'STEP' })),
            userId: this.state.userId,
        })
            .then(function (response) {
            this.showToast('success', 'Data Sent', 'Data Sent to DynamoDB 🤩')
            this.setState({  newData: [] })

                console.log('response', response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    render() {
        console.log('this.::::::', this.state.stepData)
        return (
            <View style={styles.container2}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Image style={styles.avatar} source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar1.png' }} />
                        <Text style={styles.name}>Welcome!</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]}
                        onPress={() => this.fetchData()}
                    >
                        <Text style={styles.name}>Track your Daily STEPS!</Text>
                    </TouchableOpacity>

                    <FlatList
                        style={styles.container}
                        enableEmptySections={true}
                        data={this.state.stepData}
                        keyExtractor={(item) => {
                            return item.id;
                        }}
                        renderItem={({ item, index }) => {
                            console.log('ppppppppppp', item, index)
                            return (
                                // <TouchableOpacity>
                                <View  key={`${index}`} style={styles.box}>
                                    {
                                        this.state.stepData.length > 1 && (
                                            <View key={`${index}`} style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Text style={styles.username}>{new Date(item.start).toISOString().split('T')[0]}</Text>
                                                <Text style={styles.username}>to</Text>
                                                <Text style={styles.username}>{new Date(item.end).toISOString().split('T')[0]}:</Text>
                                                <Text style={styles.username}>{item.value}</Text>
                                            </View>
                                        )
                                    }
                                </View>
                                // </TouchableOpacity>
                            )
                        }} />
                        {this.state.newData.length > 0 && (<TouchableOpacity style={[styles.buttonContainer, styles.loginButton]}
                        onPress={() => this.sendData()}
                    >
                        <Text style={styles.name}>Send Data</Text>
                    </TouchableOpacity>)}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container2: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#E6E6FA",
    },
    header: {
        backgroundColor: "#20B2AA",
    },
    headerContent: {
        padding: 10,
        alignItems: 'center',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "#FFFFFF",
        marginBottom: 10,
    },
    image: {
        width: 60,
        height: 60,
    },
    name: {
        fontSize: 22,
        color: "#FFFFFF",
        fontWeight: '600',
    },
    body: {
        padding: 30,
        // backgroundColor: "#E6E6FA",
        // height: '100%',
    },
    box: {
        padding: 5,
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOpacity: .2,
        shadowOffset: {
            height: 1,
            width: -2
        },
        elevation: 2
    },
    username: {
        color: "#20B2AA",
        fontSize: 18,
        alignSelf: 'center',
        marginLeft: 10
    },
    buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf:'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 300,
        marginTop: 20,
        borderRadius: 30,
        backgroundColor: 'transparent',
    },
    loginButton: {
        backgroundColor: "#00b5ec",

        shadowColor: "#808080",
        shadowOffset: {
            width: 0,
            height: 9,
        },
        shadowOpacity: 0.50,
        shadowRadius: 12.35,

        elevation: 19,
    },
    loginText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,

    },
});
