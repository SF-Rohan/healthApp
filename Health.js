import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Button,
    View
} from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';

export default class Health extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // stepData: [{ date: "2022-02-22", value: 3519 }, { date: "2022-02-21", value: 12495 }, { date: "2022-02-19", value: 9524 }, { date: "2022-02-18", value: 5051 }, { date: "2022-02-17", value: 3689 }, { date: "2022-02-16", value: 3861 }, { date: "2022-02-15", value: 7324 }, { date: "2022-02-14", value: 3786 }],
            stepData: [],
            auth: '',
        }

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
                            const opt = {
                                startDate: "2019-02-20T08:53:38.000Z", // required ISO8601Timestamp
                                // startDate: "2021-02-20T00:00:17.971Z", // required ISO8601Timestamp
                                endDate: "2022-02-22T08:53:38.637Z", // required ISO8601Timestamp
                                // endDate: new Date().toISOString(), // required ISO8601Timestamp
                                // bucketUnit: BucketUnit.DAY, // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
                                // bucketInterval: 1, // optional - default 1. 
                            };

                            GoogleFit.getDailyStepCountSamples(opt)
                                .then((res) => {
                                    console.log('Daily steps >>> ', res)

                                })
                                .catch((err) => { console.warn('error::::::', err) });

                            // this.fetchData();
                            // if successfully authorized, fetch data
                        } else {
                            this.setState({ auth: 'AUTH_DENIED' })

                            console.log('AUTH_DENIED ' + authResult.message);
                        }
                    })
                    .catch((err) => {
                        console.log('AUTH_ERROR', err);
                    });
            }
        });
    }

    fetchData = async () => {

        var today = new Date();
        var lastWeekDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 8,
        );
        const opt = {
            startDate: lastWeekDate.toISOString(), // required ISO8601Timestamp
            endDate: today.toISOString(), // required ISO8601Timestamp
            bucketUnit: 'DAY', // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
            bucketInterval: 1, // optional - default 1.
        };
        const res = await GoogleFit.getDailyStepCountSamples(opt);
        console.log('res::::', res)
        if (res.length !== 0) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].source === 'com.google.android.gms:estimated_steps') {
                    let data = res[i].steps.reverse();
                    dailyStepCount = res[i].steps;
                    console.log('::::::::::::::::::::ssss', data)
                    this.setState({ stepData: data })
                    //   setdailySteps(data[0].value);
                }
            }
        } else {
            console.log('Not Found');
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Authorization Status:: {this.state.auth}
                </Text>
                <Button
                    onPress={() => this.fetchData()}
                    title="Load Data"
                    color="#841584"
                />
                <View>
                 <View style={{ display: 'flex'}}>
                     <Text> Date         : Steps Count</Text>
                 </View>
                 <View>

                            {
                                this.state.stepData.length> 1 && this.state.stepData.map((item) => (
                                    <View key={item.date}>
                                        <Text>{item.date} : {item.value}</Text>
                                    </View>
                                ))
                            }
                    
                            </View>
                <View style={{marginTop: 50}}>

                <Button
                disabled={!this.state.stepData.length > 1}
                    onPress={() => {}}
                    title="Send Data"
                    color="#841584"
                    />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
// const Health = () => {

//     return (
//         <View>
//             <Text>hiiii</Text>
//         </View>
//     )
// }

// export default Health