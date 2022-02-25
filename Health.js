import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Button,
    View
} from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import axios from 'axios';



const GET_ALL_RECORD = 'https://d570ixfqvk.execute-api.ap-south-1.amazonaws.com/dev/record?userId='
const POST_RECORD = 'https://d570ixfqvk.execute-api.ap-south-1.amazonaws.com/dev/record'
const POST_ALL_RECORD = 'https://d570ixfqvk.execute-api.ap-south-1.amazonaws.com/dev/bulk-record'


export default class Health extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // stepData: [{ date: "2022-02-22", value: 3519 }, { date: "2022-02-21", value: 12495 }, { date: "2022-02-19", value: 9524 }, { date: "2022-02-18", value: 5051 }, { date: "2022-02-17", value: 3689 }, { date: "2022-02-16", value: 3861 }, { date: "2022-02-15", value: 7324 }, { date: "2022-02-14", value: 3786 }],
            stepData: [],
            auth: '',
            userId: `user${Math.floor(Math.random() * 100)}`,
        }

    }
    componentDidMount () {
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
        let lastWeekDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 8,
        );

       const response = await axios({
            method: 'get',
            url: `${GET_ALL_RECORD}${this.state.userId}`,
          });
          if(!!response && !!response.data && !!response.data.data) {
            const a = response.data.data.Items
            this.setState({ stepData: a})
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
                    data = data.map(item => ({
                        value: item.steps,
                        name: item.dataTypeName,
                        start: new Date(item.startDate).toISOString().split('T')[0],
                        end: new Date(item.endDate).toISOString().split('T')[0],
                    }))
                    // dailyStepCount = res[i].steps;
                    this.setState({ stepData: [...this.state.stepData, ...data] })
                    axios.post(POST_ALL_RECORD, {
                        records: data.map(item => ({...item, type: 'STEP' })),
                        userId: this.state.userId,
                    })
                      .then(function (response) {

                        console.log('response',response);
                      })
                      .catch(function (error) {
                        console.log(error);
                      });
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
                                    <View key={item.start} style={{display:'flex', flexDirection: 'row'}}>
                                        <Text>{new Date(item.start).toISOString().split('T')[0]} </Text>
                                        <Text> to </Text>
                                        <Text> {new Date(item.end).toISOString().split('T')[0]}</Text>
                                        <Text>  : {item.value} </Text>
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
