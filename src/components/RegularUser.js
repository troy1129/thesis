import RNFetchBlob from 'react-native-fetch-blob';
var ImagePicker = require('react-native-image-picker');
import React, { Component } from "react";
import { Platform, Text, TouchableOpacity, View, Image, Dimensions, TextInput, StyleSheet, TouchableHighlight, Keyboard, Alert, BackHandler } from "react-native";
import Modal from 'react-native-modal';
import BottomDrawer from 'rn-bottom-drawer';
import ActionButton, { ActionButtonItem } from 'react-native-action-button';
import AwesomeButton from 'react-native-really-awesome-button';
import Button from 'react-native-button';
import Drawer from 'react-native-circle-drawer';
import 'babel-polyfill';
import 'es6-symbol';
import RadioGroup from 'react-native-radio-buttons-group';
import apiKey from '../config/apiKey';
import _ from 'lodash';
import app, {fire2} from '../config/fire';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import PolyLine from '@mapbox/polyline';
import ImageView from 'react-native-image-view';
import Geolocation from 'react-native-geolocation-service';
import Routes from '../Routes';
import MapViewDirections from 'react-native-maps-directions';


var options = {
};
const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

var screen = Dimensions.get('window');

const SPACE = 0.001

export default class RegularUser extends Component {
 _isMounted = false;
 constructor(props) {
 super(props);
 this.getImage = this.getImage.bind(this)
 this.state = {
 isModalVisible: false,
 hasResponderAlerted: false,
 hasVolunteerAlerted: false,
 userKey: "",
 userType: '',
 incidentType: "Vehicular Accident",
 incidentLocation: "",
 firstName: "",
 lastName: "",
 user: null,
 markerLat: null,
 isIncidentReady: false,
 markerLng: null,
 unresponded: true,
 pinFinal:false,
 incidentNote:'',
 isResponding: false,
 isSettled: false,
 incidentID: '',
 isImageViewVisible: false,
 imageIndex: '',
 image_uri: '',
 uploading: false,
 progress: 0,
 incidentUserKey: '',
 reportedBy: '',
 timeReceived: '',
 timeResponded: '',
 responderResponding: '',
 volunteerResponding: '',
 userId: '',
 destinationPlaceId: '',
 responderLat: null,
 responderLng: null,
 volunteerLat: null,
 volunteerLng: null,
 isRequestingResponders: false,
 isRequestingVolunteers: false,
 responderRespondingID: '',
 coordinates: {
 lng: null,
 lat: null
 },
 markerCoords: {
 lng: null,
 lat: null
 },
 pointCoords: [],
 markerCoordsLat: null,
 markerCoordsLng: null,
 error: "",
 latitude: null,
 longitude: null,
 locationPredictions: [],
 data: [
 {
 label: "Vehicular Accident",
 value: "Vehicular Accident"
 },
 {
 label: "Physical Injury",
 value: "Physical Injury"
 }
 ]
 };
 this.onChangeDestinationDebounced = _.debounce(
 this.onChangeDestination,
 1000
 );
 }


 getImage() {

 ImagePicker.launchCamera(options, (response) => {
 if (response.didCancel) {
 Alert.alert('User Cancelled Taking photo')
 }
 else {
 this.imageBlob(response.uri)
 .then(alert('Uploading Please Wait!'), this.setState({ uploading: true }), console.log(this.state.uploading))
 .then(url => { alert('Photo has been Uploaded'); this.setState({ image_uri: url, uploading: false }); console.log(this.state.uploading) })
 .catch(error => console.log(error))
 }

 }
 )
 };
 

 componentWillMount() {
 BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
 }

 componentWillUnmount() {
 BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
 }

 onBackPress = () => {

 //Code to display alert message when use click on android device back button.
 Alert.alert(
 ' Exit From App ',
 ' Do you want to exit Tabang! Application?',
 [
 { text: 'Yes', onPress: () => BackHandler.exitApp() },
 { text: 'No', onPress: () => console.log('NO Pressed') }
 ],
 { cancelable: false },
 );

 // Return true to enable back button over ride.
 return true;
 }

 onPress = data => {
 this.setState({ data });
 let selectedButton = this.state.data.find(e => e.selected == true);
 selectedButton = selectedButton ? selectedButton.value : this.state.data[0].label;
 this.setState({ incidentType: selectedButton });

 }

 authListener() {
    this.fireBaseListener=app.auth().onAuthStateChanged(user => {
 if (user) {
 this.setState({ user, userId: user.uid });
 us = user.uid;
 this.getUserInfo();
 this.incidentState(this.state.userId);
 }
 });
 }

 getUserInfo = () => {
 var userType = '';
 var firstName = '';
 var lastName = '';
 var that = this;
 console.log("HI", this.state.userId);
 this.user2 = app.database().ref(`users/${this.state.userId}/`);
 this.user2.on('value', function (snapshot) {
 const dataUser = snapshot.val() || null;
 console.log("data2", dataUser);

 if (dataUser) {
 userType = dataUser.user_type;
 firstName = dataUser.firstName;
 lastName = dataUser.lastName;
 // profileName = dataUser.firstName;
 // profileType = dataUser.user_type;
 }
 that.setState({ userType, firstName, lastName });
 console.log("USER TYPE", that.state.userType, that.state.firstName, that.state.lastName, that.state.userId);

 // app.database().ref(`mobileUsers/Regular User/${that.state.userId}`).update({
 // incidentID: '',
 // })
 })



 }

 componentDidMount() {

 this.authListener();

 Geolocation.getCurrentPosition(
 position => {
 this.setState({
 latitude: position.coords.latitude,
 longitude: position.coords.longitude
 });

 app.database().ref(`mobileUsers/Regular User/${this.state.userId}`).update({
 coordinates: {
 lng: this.state.longitude,
 lat: this.state.latitude
 },
 })
 .then(() => {
 console.log('Data coordinates: ', this.state.longitude, ' ', this.state.latitude);
 });

 },
 error => this.setState({ error: error.message }),
 { enableHighAccuracy: true }
 );

 this.watchId = Geolocation.watchPosition(

 position => {
 this.setState({
 latitude: position.coords.latitude,
 longitude: position.coords.longitude
 });

 app.database().ref(`mobileUsers/Regular User/${this.state.userId}`).update({
 coordinates: {
 lng: this.state.longitude,
 lat: this.state.latitude
 },
 })
 .then(() => {
 console.log('Coordinates Updated: ', this.state.longitude, ' ', this.state.latitude);
 });

 },
 error => this.setState({ error: error.message }),
 { enableHighAccuracy: true, distanceFilter: 5, interval: 4000 }
 );
 }




 responderCoordinates = (responderRespondingID) => {

 console.log("Welcome RESPONDER", this.state.responderRespondingID);
 this.userIncidentId = app.database().ref(`mobileUsers/Responder/${responderRespondingID}`);
 var latitude = '';
 var longitude = '';
 var that = this;
 if (responderRespondingID) {
 this.userIncidentId.on('value', function (snapshot) {
 incidentDetails = snapshot.val() || null;
 latitude = incidentDetails.coordinates.lat;
 longitude = incidentDetails.coordinates.lng;
 console.log("LAT AND LONG OF RESPONDER USERSS", incidentDetails.coordinates.lat);
 that.setState({
 responderLat: latitude,
 responderLng: longitude,
 });
 })
 }
 }

 volunteerCoordinates = (volunteerRespondingID) => {

 console.log("Welcome Volunteer", this.state.volunteerRespondingID);
 var userIncidentId = app.database().ref(`mobileUsers/Volunteer/${volunteerRespondingID}`);
 var latitude = '';
 var longitude = '';
 var that = this;
 if (volunteerRespondingID) {
 userIncidentId.on('value', function (snapshot) {
 incidentDetails = snapshot.val() || null;
 latitude = incidentDetails.coordinates.lat;
 longitude = incidentDetails.coordinates.lng;
 console.log("LAT AND LONG OF VOLUNTEER USERSSS", incidentDetails.coordinates.lat);
 that.setState({
 volunteerLat: latitude,
 volunteerLng: longitude,
 });
 })
 }
 }

 incidentState = (userId) => {
 console.log("user id here", this.state.userId);
 // var regularUserListen = app.database().ref(`mobileUsers/Regular User/${this.state.userId}/`);

 var that = this;

 console.log("this state", this.state.userId)
 console.log("user bit not state", userId);
 this.regularUserListen = app.database().ref(`mobileUsers/Regular User/${userId}`);
 this.regularUserListen.on('value', function (snapshot) {

 var snap = snapshot.val();
 console.log("user data mobile regular", snap);
 var incidentID = snap.incidentID;
 console.log("INCIDENt", incidentID);

 if (incidentID !== "") {
 console.log("hey i got here");
 
 this.incidentIDListen = app.database().ref(`incidents/${incidentID}`);
 this.incidentIDListen.on('value', (snapshot) => {
 incidentDetails = snapshot.val() || null;
 var image_uri = incidentDetails.image_uri;
 var markerLat = incidentDetails.coordinates.lat;
 var markerLng = incidentDetails.coordinates.lng;
 console.log("COORDINATES", markerLat, markerLng);
 var reportedBy = incidentDetails.reporterUID;
 var isSettled = incidentDetails.isSettled;
 var incidentType = incidentDetails.incidentType;
 var incidentLocation = incidentDetails.incidentLocation;
 var destinationPlaceId = incidentDetails.destinationPlaceId;
 console.log("DESTINATION PLACE", destinationPlaceId);
 var incidentLocation = incidentDetails.incidentLocation;

//  if(incidentDetails !== null && isSettled){
//     that.setState({isIncidentReady:true});
//     that.setState({ markerLat, markerLng, isSettled: false, incidentType, incidentLocation, isIncidentReady: true, image_uri });
//     that.getRouteDirection(destinationPlaceId, incidentLocation);
//  }

 if (reportedBy === userId && isSettled === false) {

 that.incidentResponderListener(incidentID);
 that.incidentVolunteerListener(incidentID);
 that.setState({ markerLat, markerLng, isSettled: false, incidentType, incidentLocation, isIncidentReady: true, image_uri });
 that.getRouteDirection(destinationPlaceId, incidentLocation);


 }
 else if (reportedBy === userId && isSettled === true) {
 that.incidentSettled();

 }
 })
 }
 else {
 console.log("incident Id is not here");
 console.log("incident is not ready", that.state.isIncidentReady);
 }

 })
 }

 clearSettled = () => {
    var regularListen = app.database().ref(`users/${this.state.userId}`);
    regularListen.update({
    incidentId: '',
    })

 }

 incidentSettled = () => {


 this.setState({ isSettled: true, isIncidentReady: false, hasResponderAlerted: false, hasVolunteerAlerted: false ,incidentLocation:'',pinUpdate:false, incidentID:''});
 this.setState({ markerCoords: null });

 Alert.alert(
 "INCIDENT HAS BEEN RESPONDED!! ",
 `Thank you for reporting! `
 ,
 [
 { text: "Ok", onPress: () => { this.clearSettled() } },
 ],
 { cancelable: false }
 );

 var regularListen = app.database().ref(`mobileUsers/Regular User/${this.state.userId}`);
 regularListen.update({
 incidentID: '',
 })

 }

 hasResponderAlert = () => {

 this.setState({ hasResponderAlerted: true });
 console.log("ALERT HAS BEEN TRIGGERED");
 }

 incidentResponderListener = (incidentID) => {
 console.log("naa ka diri?", incidentID);
 console.log("hi there", this.state.incidentID);
 this.responderListen = app.database().ref(`incidents/${incidentID}`);
 var that = this;
 var responderRespondingID = '';
 // var hasResponderAlerted = this.state.hasResponderAlerted;

 this.responderListen.on('value', function (snapshot) {
 const data2 = snapshot.val() || null;
 console.log("data2222222222222222", data2);

 if (data2) {
 responderRespondingID = data2.responderResponding;
 // var destinationPlaceId = data2.destinationPlaceId;
 if (responderRespondingID) {
 if (that.state.hasResponderAlerted === false) {
 Alert.alert(
 "A Responder has accepted an incident "
 , `Responder is on the way!`,
 [
 {
 text: "Ok", onPress: () => {
 that.hasResponderAlert()
 }
 },
 ],
 { cancelable: false }
 );
 }
 console.log("responder responding", responderRespondingID);
 // that.setState({ responderRespondingID });
 that.responderCoordinates(responderRespondingID);
 }
 else {
 console.log("responder NOT responding", responderRespondingID);
 that.setState({ responderRespondingID });
 that.responderCoordinates(responderRespondingID);
 }

 }

 })
 }

 hasVolunteerAlert = () => {
 // var hasVolunteerAlerted = true;
 this.setState({ hasVolunteerAlerted: true });
 console.log("ALERT HAS BEEN TRIGGERED");
 }

 incidentVolunteerListener = (incidentID) => {
 console.log("naa ka diri?", incidentID);
 console.log("hi there", this.state.incidentID);
 this.volunteerListen = app.database().ref(`incidents/${incidentID}`);
 var that = this;
 let volunteerRespondingID = '';

 let hasVolunteerAlerted = this.state.hasVolunteerAlerted;
 this.volunteerListen.on('value', function (snapshot) {
 const data2 = snapshot.val() || null;
 console.log("data333333", data2);

 if (data2) {
 volunteerRespondingID = data2.volunteerResponding;

 if (volunteerRespondingID) {
 if (hasVolunteerAlerted === false) {
 Alert.alert(
 "A Volunteer has accepted an incident "
 , `Volunteer is on the way!`,
 [
 { text: "Ok", onPress: () => { that.hasVolunteerAlert() } },
 ],
 { cancelable: false }
 );

 }
 console.log("volunteer responding", volunteerRespondingID);
 // that.setState({ volunteerRespondingID });
 that.volunteerCoordinates(volunteerRespondingID); // turn this off
 } else {
 console.log("volunteer responding", volunteerRespondingID);
 that.setState({ volunteerRespondingID });
 that.volunteerCoordinates(volunteerRespondingID);
 }

 }

 })
 }

 componentWillUnmount() {
 this._isMounted = false;
 this.fireBaseListener && this.fireBaseListener();
 this.authListener = undefined;

 Geolocation.clearWatch(this.watchId);
 this.volunteerListen.off();
 this.responderListen.off();
 this.regularUserListen.off();
 this.user2.off();
 this.userIncidentId.off();
 this.incidentIDListen.off();
 }



 getRouteDirection(destinationPlaceId, destinationName) {
 fetch(
 `https://maps.googleapis.com/maps/api/directions/json?origin=${
 this.state.latitude
 },${
 this.state.longitude
 }&destination=place_id:${destinationPlaceId}&key=${apiKey}`
 )
 .then((res) => res.json())
 .then(json => {
 const points = PolyLine.decode(json.routes[0].overview_polyline.points);
 const pointCoords = points.map(point => {
 return { latitude: point[0], longitude: point[1] };
 });
 this.setState({
 pointCoords,
 locationPredictions: [],
 incidentLocation: destinationName,
 destinationPlaceId,
 });
 Keyboard.dismiss();
 this.map.fitToCoordinates(pointCoords);
 })
 .catch((error) => {
 console.log(error);
 });
 }

 async onChangeDestination(incidentLocation) {
 this.setState({ incidentLocation });
 const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input={${incidentLocation}}&location=${
 this.state.latitude
 },${this.state.longitude}&radius=2000`;
 try {
 const result = await fetch(apiUrl);
 const jsonResult = await result.json();
 this.setState({
 locationPredictions: jsonResult.predictions
 });
 console.log(jsonResult);
 }
 catch (err) {
 console.log(err);
 }

 }

 _toggleModal = () => {
 this.setState({ isModalVisible: !this.state.isModalVisible });
 }

 _openDrawer = () => {
 this.refs.DRAWER.open();
 }

 setIncidentID = () => {
 app.database().ref(`mobileUsers/Regular User/${this.state.userId}`).update({
 incidentID: this.state.incidentUserKey,
 });
 app.database().ref(`users/${this.state.userId}`).update({
    incidentId: this.state.incidentUserKey,
});

 }

 


 imageBlob(uri, mime = 'application/octet-stream') {
 return new Promise((resolve, reject) => {
 const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
 let uploadBlob = null;
 const imageRef = app.storage().ref('images').child(`/RegularUser/${this.state.userId}`);

 fs.readFile(uploadUri, 'base64')
 .then((data) => {
 return Blob.build(data, { type: `${mime};BASE64` });
 })
 .then((blob) => {
 uploadBlob = blob;
 return imageRef.put(blob, { contentType: mime });
 })
 .then(() => {
 uploadBlob.close();
 return imageRef.getDownloadURL();
 })
 .then((url) => {
 resolve(url);
 console.log(url);
 })
 .catch((error) => {
 reject(error);
 })
 })
 }


 submitIncidentHandler = () => {
 var date = Date(Date.now());
 var fullName = this.state.firstName+' '+this.state.lastName;
 date1 = date.toString();
 this.setState({pinFinal:true,isModalVisible: !this.state.isModalVisible,
 })
 var coords = this.state.pointCoords;
 var coords2 = this.state.pointCoords[coords.length - 1];
 var coordLat = coords2.latitude;
 var coordLng = coords2.longitude;
 app.database().ref("/incidents").push({
     
 destinationPlaceId: this.state.destinationPlaceId,
 incidentType: this.state.incidentType,
 incidentLocation: this.state.incidentLocation,
 incidentNote:this.state.incidentNote,
 timeReceived: date1,
 image_uri: this.state.image_uri,
 isResponding: false,
 markerLat:this.state.markerLat,
 markerLng:this.state.markerLng,
 reporterUID: this.state.userId,
 reporterName: fullName,
 responderResponding: '',
 volunteerResponding: '',
 originalResponderName: '',
 originalVolunteerName:'',
 coordinates: {
 lat: coordLat,
 lng: coordLng
 },

 unresponded: true,

 isShown: false,
 isSettled: false,
 isRedundantReport:false,

 isRequestingResponders: false,
 isRequestingVolunteers: false,

 isRespondingResponderShown:false,
 isRespondingVolunteerShown:false,

 isRespondingResponder:false,
 isRespondingVolunteer: false,

 isArrivedResponder: false,
    isArrivedResponderShown: false,
    isArrivedVolunteer: false,
    isArrivedVolunteerShown: false,

 }).then((snap) => {
 const incidentUserKey = snap.key;
 this.setState({ incidentUserKey });
 console.log("INCIDENT USER KEY HEREEEEE: ", this.state.userId);
 })
 this.setState({
 incidentType: '',
 incidentLocation: '',
 unresponded: null,
 isResponding: null,
 isSettled: null,
 image_uri: '',
 reportedBy: '',
 timeReceived: '',
 timeResponded: '',
 responderResponding: '',
 volunteerResponding: '',
 coordinates: {
 lat: null,
 lng: null
 },
 markerCoords: {
 lat: null,
 lng: null
 },
 destinationPlaceId: '',
 isRequestingResponders: false,
 isRequestingVolunteers: false,


 });
 console.log(this.state.incidentsList);
 Alert.alert(
 'Attention: ',
 'Report has been sent',
 [
 {
 text: 'Cancel',
 onPress: () => console.log('Cancel Pressed'),
 style: 'cancel',
 },
 { text: 'OK', onPress: () => this.setIncidentID() },
 ],
 { cancelable: false },
 );
 }

 addToMobileUsers = () => {
 let user = app.auth().currentUser;
 var addThis = app.database().ref(`mobileUsers/Regular User/${user.uid}`)
 addThis.set({
 incidentID:""
 });
 }

 signOutUser = () => {

 // var adaRef = fire2.database().ref(`mobileUsers/Regular User/${us}`);
 // adaRef.remove().then(function () {
 // console.log("Remove succeeded.")
 // }).catch(function (error) {
 // console.log("Remove failed: " + error.message)
 // });
 

 // this.setState({ incidentID: '',
 // user:null,
 // userId:''
 // });

 var user = app.auth().currentUser;
 app.database().ref(`mobileUsers/Regular User/${user.uid}`).off();
 app.database().ref(`mobileUsers/Regular User/${user.uid}`);
 var deleteThis = fire2.database().ref(`mobileUsers/Regular User/${user.uid}`)
 deleteThis.remove().then(() => {
 app.auth().signOut().then(function () {
 console.log("SUCCESFULL LOG OUT");
 }).catch(function (error) {
 console.log(error)
 });
 })

 // app.auth().signOut().then(function () {
 // // Sign-out successful.

 // console.log("SUCCESFULL LOG OUT");

 // }).catch(function (error) {
 // // An error happened.
 // console.log(error);
 // });

 }
 pressedPrediction(place_id, description) {
 // console.log(prediction);
 Keyboard.dismiss();
 this.setState({
 locationPredictions: [],
 incidentLocation: description,
 destinationPlaceId: place_id
 });
 Keyboard;
 this.getRouteDirection(place_id, description);
 }

 
 


 renderContent = () => {
 const { isImageViewVisible } = this.state;
 const images = [
 {
 source: {
 uri: this.state.image_uri
 },
 },
 ];
 return (
 <View style={styles.main}>
 <View>
 <Text style={{
 fontSize: 20,
 color: 'white',
 fontWeight: 'bold',
 textAlign: 'center',
 marginTop: 5
 }}>
 {this.state.incidentType}
 </Text>
 <Text style={{
 color: 'white',
 fontSize: 19,
 textAlign: 'center',
 marginBottom: 7
 }}>
 {this.state.incidentLocation}
 </Text>
 {this.state.image_uri? 
 <View style={styles.buttonContainer}><AwesomeButton height={50} width={190} backgroundColor="#467541" onPress={() => {
 this.setState({
 isImageViewVisible: true,
 });
 }}>Check Photo </AwesomeButton></View> 
 :null }

 
<ImageView
 glideAlways
 images={images}
 animationType="fade"
 isVisible={isImageViewVisible}
 renderFooter={this.renderFooter}
 onClose={() => this.setState({ isImageViewVisible: false })}
 />
 </View>
 </View>
 )
 }

 renderSideMenu() {
 return (
 <View>
 <Routes />
 <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 50 }}>
 Hello {this.state.firstName}!
 </Text>
 <Text style={{ color: 'white', fontWeight: 'normal', fontSize: 15 }}>
 You are a {this.state.userType}.
 </Text>
 <TouchableOpacity /*disabled={this.state.isIncidentReady}*/ onPress={this.signOutUser}>
 <Text style={{ color: 'white', fontSize: 30 }}>
 Log Out
 </Text>
 </TouchableOpacity>
 </View>
 )
 }

 checkState =()=>
 {
 alert(JSON.stringify(this.state.isIncidentReady))
 }

 usePinLocation = () => 
 { 
 Alert.alert("Long Press Marker and Move to Desired Location!")
 this.setState({incidentLocation:'Pinned Location',
 isSettled:false,
 pinUpdate:true,
 destinationPlaceId:'Pinned Location',
 isModalVisible: !this.state.isModalVisible,
 markerLat: this.state.latitude+SPACE,
 markerLng:this.state.longitude+SPACE,
 })
 }

 renderTopRightView() {
 return (
 <View style={{ top: 10, left: 75 }}>
 <Image style={{ width: 65, height: 65 }} source={require("../images/avatar.png")} />
 </View>
 )
 }

 render() {
 const { isImageViewVisible, imageIndex } = this.state;
 const images = [
 {
 source: {
 uri: this.state.image_uri
 },
 },
 ];
 console.log("marekr coords", this.state.markerLat, this.state.markerLng, this.state.isSettled);
 let marker = null;
 if (this.state.markerLat && this.state.isIncidentReady===false) {
 const { pointCoords } = this.state;

 marker = (
 
 <Marker
 draggable
 onPress={this.checkState}
 onDragEnd={
 (e)=>{this.setState({
 markerLat:e.nativeEvent.coordinate.latitude,
 markerLng:e.nativeEvent.coordinate.longitude,
 pointCoords:pointCoords.concat([e.nativeEvent.coordinate]),
 isModalVisible: !this.state.isModalVisible
 })}
 }
 coordinate={
 {
 latitude: this.state.markerLat,
 longitude: this.state.markerLng
 }
 }
 title={`${this.state.incidentType}`}
 description={this.state.incidentLocation}
 >
 <Image
 source={require("../images/alert.png")}
 style={{ height: 45, width: 45 }} />
 </Marker>

 )
 }

 else if (this.state.markerLat && this.state.isIncidentReady===true){
 marker = (
 
 <Marker
 
 coordinate={
 {
 latitude: this.state.markerLat,
 longitude: this.state.markerLng
 }
 }
 title={`${this.state.incidentType}`}
 description={this.state.incidentLocation}
 >
 <Image
 source={require("../images/alert.png")}
 style={{ height: 45, width: 45 }} />
 </Marker>

 )

 }

 if (this.state.latitude) {
 getUserLocation = (
 <Marker
 coordinate={
 {
 latitude: this.state.latitude,
 longitude: this.state.longitude
 }
 }
 title={`Hello ${this.state.firstName}`}
 description={'You are here'}
 >
 <Image
 source={require("../images/userPosition.png")}
 style={{ height: 45, width: 45 }} />
 </Marker>
 );
 }
 var markerResponder = null;
 if (this.state.responderLat) {
 markerResponder = (
 <Marker
 coordinate={{
 latitude: this.state.responderLat,
 longitude: this.state.responderLng,
 }}
 title={`Responder`}
 description={'Responder is here'}
 >
 <Image
 source={require("../images/tracking_responder.png")}
 style={{ height: 45, width: 45 }} />
 </Marker>
 );
 }

 var markerVolunteer = null;
 if (this.state.volunteerLat) {
 markerVolunteer = (
 <Marker
 coordinate={{
 latitude: this.state.volunteerLat,
 longitude: this.state.volunteerLng,
 }}
 title={`Volunteer`}
 description={'Volunteer is here'}
 >
 <Image
 source={require("../images/tracking_volunteer.png")}
 style={{ height: 45, width: 45 }} />
 </Marker>
 );
 }
 if (this.state.latitude === null) return null;

 const locationPredictions = this.state.locationPredictions.map(
 prediction => (
 <TouchableHighlight
 key={prediction.id}
 onPress={() =>
 this.pressedPrediction(
 prediction.place_id,
 prediction.description
 )
 }
 >

 <Text style={styles.locationSuggestion}>
 {prediction.description}
 </Text>
 </TouchableHighlight>
 )
 );


 return (
 <View style={styles.container}>

 <Drawer
 style={styles.mapDrawerOverlay}
 ref="DRAWER"
 primaryColor="#2d2d2d"
 secondaryColor="#5C7788"
 cancelColor="#5C7788"
 sideMenu={this.renderSideMenu()}
 topRightView={this.renderTopRightView()} />

 <View style={{ alignSelf: 'flex-end', position: 'absolute', marginTop: 8, paddingRight: 8 }}><AwesomeButton backgroundColor="#2d2d2d" borderRadius={50} height={35} width={35} raiseLevel={2} backgroundDarker="rgba(0,0,0,0.05)" onPress={this._openDrawer}>
 <Image style={{ width: 22.63, height: 15.33 }} source={require("../images/menu.png")} /></AwesomeButton></View>

 <MapView
 ref={map => { this.map = map; }}
 provider={PROVIDER_GOOGLE} // remove if not using Google Maps
 style={styles.map}
 region={{
 latitude: this.state.latitude,
 longitude: this.state.longitude,
 latitudeDelta: 0.015,
 longitudeDelta: 0.0121,
 }}
 // showsUserLocation={true}

 >
 {getUserLocation}

 {/* <Polyline
 coordinates={this.state.pointCoords}
 strokeWidth={4}
 strokeColor="red"
 /> */}
 {this.state.isSettled === true ? null : <MapViewDirections
 origin={{latitude: this.state.latitude, longitude: this.state.longitude}}
 destination={{latitude: this.state.markerLat, longitude: this.state.markerLng}}
 apikey={apiKey}
 strokeWidth={3}
 strokeColor="hotpink"
 />
 }
 {this.state.isSettled === true ? null : marker}
 {this.state.isSettled === true ? null : markerResponder}
 {this.state.isSettled === true ? null : markerVolunteer}

 </MapView>

 {this.state.isIncidentReady ?
 <BottomDrawer containerHeight={170} startUp={false} roundedEdges={true}>
 {this.renderContent()}
 </BottomDrawer> :
 <ActionButton
 buttonColor="#2d2d2d"
 shadowStyle={{ shadowRadius: 10, shadowColor: 'black', shadowOpacity: 1 }}
 position='left'
 offsetX={13}
 onPress={this._toggleModal}
 icon={<Image source={require("../images/sendreport.png")} />}
 />
 }
 {/* <TouchableOpacity
 style={{
 position: 'absolute',
 top: '7%',
 left: '77%'
 }}
 onPress={() => this.signOutUser()}
 >
 <Image
 style={{ width: 50, height: 50 }}
 source={require("../images/exit.png")}
 />
 </TouchableOpacity>
 <TouchableOpacity style={{
 position:'absolute',
 top: '85%',
 left:'5%'}} onPress={this._toggleModal}>
 <Image
 style={{ width: 50, height: 50 }}
 source={require('../images/send.png')}
 />
 </TouchableOpacity> */}
 <Modal isVisible={this.state.isModalVisible}
 style={{
 justifyContent: 'center',
 borderRadius: 20,
 shadowRadius: 10,
 width: screen.width - 50,
 backgroundColor: 'white',

 }}
 >
 <TouchableOpacity onPress={this._toggleModal}>
 <Image
 style={{ width: 45, height: 45, marginLeft: 240 }}
 source={require('../images/cancel.png')}
 />
 </TouchableOpacity>
 <Text style={{
 fontSize: 20,
 fontWeight: 'bold',
 textAlign: 'center',
 marginTop: 5,
 marginBottom: 15
 }}>INPUT INCIDENT
 </Text>
 <TouchableOpacity
 disable={!this.state.image_uri}
 onPress={() => {
 this.setState({
 isImageViewVisible: true,
 });
 }}
 disabled={!this.state.image_uri}

 >
 <Image source={{ uri: this.state.image_uri }} style={{
 width: 100, height: 100,
 marginBottom: 15, left: 100
 }}></Image>
 </TouchableOpacity>
 <RadioGroup radioButtons={this.state.data} onPress={this.onPress} />

 {this.state.pinUpdate===true ? null :

 <TextInput
 placeholder="Enter location.."
 style={styles.destinationInput}
 onChangeText={incidentLocation => {
 this.setState({ incidentLocation });
 this.onChangeDestinationDebounced(incidentLocation);
 }}
 value={this.state.incidentLocation}

 />
 
 }
 <TextInput
 
 placeholder="Additional Details"
 style={styles.detailsInput}
 onChangeText={incidentNote => {
 this.setState({ incidentNote });
 }}
 value={this.state.incidentNote}
 multiline
 />
 {locationPredictions}
 
 <Button
 style={{ fontSize: 18, color: "white" }}
 onPress={this.getImage}
 disabled={this.state.uploading}
 containerStyle={{
 padding: 8,
 marginLeft: 70,
 marginRight: 70,
 height: 40,
 borderRadius: 6,
 backgroundColor: "mediumseagreen",
 marginTop: 20
 }}
 >
 <Text style={{ justifyContent: "center", color: "white" }}>
 Take a Photo
 </Text>
 </Button>

 
 <Button
 style={{ fontSize: 18, color: 'white' }}
 onPress={this.submitIncidentHandler}
 disabled={!this.state.destinationPlaceId || !this.state.incidentLocation || !this.state.incidentType || this.state.uploading}
 containerStyle={{
 padding: 8,
 marginLeft: 70,
 marginRight: 70,
 height: 40,
 borderRadius: 6,
 backgroundColor: 'mediumseagreen',
 marginTop: 20,
 }}
 >
 <Text style={{ justifyContent: 'center', color: 'white' }} >Submit Incident</Text>
 </Button>

 {this.state.destinationPlaceId ? null: <Button
 style={{ fontSize: 18, color: 'white' }}
 onPress={this.usePinLocation}
 containerStyle={{
 padding: 8,
 marginLeft: 70,
 marginRight: 70,
 height: 40,
 borderRadius: 6,
 backgroundColor: 'mediumseagreen',
 marginTop: 20,
 }}
 >
 <Text style={{ justifyContent: 'center', color: 'white' }} >Use Pin Location</Text>
 </Button>}

 <ImageView
 glideAlways
 style={{ flex: 1, width: undefined, height: undefined }}
 images={images}
 imageIndex={imageIndex}
 animationType="fade"
 isVisible={isImageViewVisible}
 renderFooter={this.renderFooter}
 onClose={() => this.setState({ isImageViewVisible: false })}
 />
 </Modal>
 </View>
 );
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
 main: {
 flex: 1,
 padding: 30,
 flexDirection: 'column',
 justifyContent: 'center',
 backgroundColor: '#6565fc'
 },
 buttonContainer: {
 flex: 1,
 },
 responderButtons: {
 flex: 1,
 flexDirection: 'row',
 justifyContent: 'center',
 padding: 10,
 alignItems: 'center',
 marginBottom: 15
 },
 detailsInput:{
 borderWidth: 0.5,
 borderColor: "grey",
 height: 40,
 marginTop: 10,
 marginLeft: 20,
 flexWrap: "wrap",
 marginRight: 20,
 padding: 5,
 backgroundColor: "white"

 },
 container: {
 ...StyleSheet.absoluteFillObject,
 flex: 1,

 },
 map: {
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
 locationSuggestion: {
 backgroundColor: "white",
 padding: 3,
 fontSize: 15,
 borderWidth: 0.5
 },
 centerImage: {
 justifyContent: 'center',
 alignItems: 'center',
 flex: 1,
 }
});