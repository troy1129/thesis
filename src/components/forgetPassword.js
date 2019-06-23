import React, { Component } from "react";
import {
Text, TouchableOpacity, View, TextInput, StyleSheet, 
TouchableHighlight, Keyboard, Alert
} from "react-native";
import Button from 'react-native-button'
import 'babel-polyfill';
import 'es6-symbol';
import app from '../config/fire';
import _ from 'lodash';
import { Formik } from 'formik'
import * as yup from 'yup'
export default class forgetPassword extends Component
{

constructor(props)
{
    super(props);
    this.state= {
      
        email:'',
    }
}

forgetPasswordSubmit = (values) =>
{
    const email=values.email
    app.auth().sendPasswordResetEmail(email).then(
        Alert.alert(
            "Password Reset",
            `Password has been reset
             Please check your email "${email}" `,
             [
                { text: "Ok", onPress: () => {console.log('Pressed')}},
            ],
            { cancelable: false }
        )
    ).catch(err=>{
        Alert.alert("There is no User registered to this Email Address!")
    })
}

render()
{
    return(
        <View style={styles.container} >
      <Formik
      enableReinitialize 
      initialValues={{ email:this.state.email}}
        onSubmit={values => {
          this.forgetPasswordSubmit(values)
        
        }}
        validationSchema={
          yup.object().shape({
            email: yup
              .string()
              .matches(/[a-zA-Z0-9]+$/, 'Email contains Special Characters')
              .email('Invalid Email Format')
              .required('Email Address is Required'),
     
          })
        
        }>
        {({ values, handleChange, errors, setFieldTouched, touched, handleSubmit,isValid }) => (
            <View>
              <TextInput style={styles.inputBox}
                underlineColorAndroid='rgba(0,0,0,0)'
                underlineColorAndroid='rgba(0,0,0,0)'
                placeholder="Email Address"
                placeholderTextColor="#ffffff"
                selectionColor="#fff"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={() => setFieldTouched('email')}  /> 
                {touched.email && errors.email &&
                <Text style={{ fontSize: 15, color: 'red' }}>{errors.email}</Text>
                        }
            {touched.currentPasswordEmail && errors.currentPasswordEmail &&
            <Text style={{ fontSize: 15, color: 'red' }}>{errors.currentPasswordEmail}</Text>
                        }
           <Button 
           style={styles.button}
           disabled={(!isValid)}
            onPress={handleSubmit}>Reset Password</Button>
 </View>
        ) }
      </Formik>
      </View>
      
    )
}
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#833030',
    },
    signupTextCont: {
      flexGrow: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingVertical: 16,
      flexDirection: 'row'
    },
    signupText: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 16
    },
    signupButton: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500'
    },
    inputBox: {
      width: 300,
      borderColor: 'rgba(255, 255,255,0.3)',
      backgroundColor: 'rgba(255, 255,255,0.3)',
      borderRadius: 10,
      paddingHorizontal: 16,
      marginVertical: 10,
      marginHorizontal: 45,
      position: 'relative'
    },
    button: {
      width: 300,
      backgroundColor: '#1c313a',
      borderRadius: 25,
      left:45,
      marginVertical: 10,
      paddingVertical: 13
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#ffffff',
      textAlign: 'center'
    }
  });