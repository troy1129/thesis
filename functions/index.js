const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.onDataAdded=functions.database.ref(`/messages/{id}`).onCreate(event => {
    const data=event.data.val();
    const newData = {
        msg: data.msg.toUpperCase()
    };
    return event.data.ref.parent.child('copiedData').set(newData)
})