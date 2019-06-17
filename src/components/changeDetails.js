import React, { Component } from "react";
import {
Text, TouchableOpacity, View, Image, Dimensions, TextInput, StyleSheet, 
TouchableHighlight, Keyboard, Alert, Platform,DrawerLayoutAndroid
} from "react-native";
import Modal from 'react-native-modal';
import ActionButton, { ActionButtonItem } from 'react-native-action-button';
import AwesomeButton from 'react-native-really-awesome-button';
import Button from 'react-native-button'
import 'babel-polyfill';
import 'es6-symbol';
import app from '../config/fire';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';


export default class changeDetails extends Component
{

constructor(props)
{
    super(props);
    this.state= {
        newPassword:'',
        currentPassword:'',
        confirmNewPassword:'',
    }
}






reAuthPassword = (currentPassword) =>
{
    var user=app.auth().currentUser
    var cred=app.auth.EmailAuthProvider.credential(user.email,currentPassword)

   return user.reauthenticateWithCredential(cred)
    
}

onChangePassword =()=>
{

// this.reAuthPassword(this.state.currentPassword).then(()=>{
    
//     }).catch((errorAuth)=>{
//         alert(JSON.stringify(errorAuth))
//     })
// })

app.auth().currentUser.updatePassword(this.state.newPassword).then(()=>{
    app.database().ref(`users/${app.auth().currentUser.uid}`).update({
        password:this.state.newPassword
    });
    alert('Password has Been Changed')
}).catch((error)=>{
    alert(JSON.stringify(error))

})


}

checkState=()=>
{
    alert(JSON.stringify(app.auth().currentUser.email))
}
render()
{
    return(
        // <Formik initialValues={{ email: '', password: '' }}
        // onSubmit={values => {
        //   this.loginUserAccount(values);
        // }}
        // validationSchema={
        //   yup.object().shape({

        //     email: yup
        //       .string()
        //       .email('Invalid Email Format')
        //       .required('Email Address is Required'),
        //     password: yup
        //       .string()
        //       .strict(true)
        //       .matches(/[a-zA-Z0-9]/, 'Password contains Special Characte')
        //       .trim('Password contains Special Characters')
        //       .required('Password is Required'),
        //   })
        // }>
        // {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (

          <View style={styles.container}>
            <TextInput style={styles.inputBox}
              underlineColorAndroid='rgba(0,0,0,0)'
              placeholder="Current Password"
              placeholderTextColor="#ffffff"
              selectionColor="#fff"
              keyboardType="email-address"
              value={this.state.currentPassword}
            //   onBlur={() => setFieldTouched('currentPassword')}
            onChangeText={currentPassword => {
                this.setState({ currentPassword:currentPassword });
            }     }       /> 
         
            <TextInput style={styles.inputBox}
              underlineColorAndroid='rgba(0,0,0,0)'
              placeholder="New Password"
              secureTextEntry={true}
              placeholderTextColor="#ffffff"
              value={this.state.newPassword}
            //   onBlur={() => setFieldTouched('newPassword')}
            onChangeText={newPassword => {
                this.setState({ newPassword:newPassword });
            }}/>

        


            <Button onPress={this.onChangePassword}>Change Password</Button>
         

          </View>
        //) closing parentheses of commented out formik
    //     }
    //   </Formik>
    )
}
}

const styles = StyleSheet.create({
    mapDrawerOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: 0.0,
        height: Dimensions.get('window').height,
        width: 10,
    },
    profile: {
        marginLeft: 12,
        marginTop: 10
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    responderButtons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        alignItems: 'center',
        marginBottom: 15
    },
    buttonContainer: {
        flex: 1,
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        justifyContent: 'center',
        backgroundColor: '#232323'
    },
    user: {
        position: 'absolute',
        top: 150
    },
    shadow: {
        shadowColor: 'black',
        shadowRadius: 100,
        shadowOpacity: 1
    },
    container: {

        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    map: {
        //     width: screen.width,
        // height: Dimensions.get('window').height,
        ...StyleSheet.absoluteFillObject,

    },
    title: {
        marginBottom: 20,
        fontSize: 25,
        textAlign: 'center'
    },
    itemInput: {
        height: 50,
        padding: 4,
        marginRight: 5,
        fontSize: 23,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
        color: 'black'
    },
    buttonText: {
        fontSize: 18,
        color: '#111',
        alignSelf: 'center'
    },
    button: {
        height: 45,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    valueText: {
        fontSize: 18,
        marginBottom: 50,
    },
    destinationInput: {
        borderWidth: 0.5,
        borderColor: "grey",
        height: 40,
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
        padding: 5,
        backgroundColor: "white"
    },
    feedbackInput:{
        borderWidth: 0.5,
        borderColor: "grey",
        height: 100,
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20,
        padding: 5,
        backgroundColor: "white"
    },
    locationSuggestion: {
        backgroundColor: "white",
        padding: 3,
        fontSize: 15,
        borderWidth: 0.5
    },
});