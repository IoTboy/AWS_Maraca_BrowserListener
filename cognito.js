
var AWS = require('aws-sdk');

var awsRegion = "us-east-1";
var deviceId = "team38";
var streamName = 'IotCognitoKinesisStream'; // Kinesis stream that we'll use in this example
var partitionKey = "xyz";
var tableName = "IotCognitoTable";
var cognitoParams = {
    AccountId: "923409842521",
    RoleArn: "arn:aws:iam::923409842521:role/Cognito_iotpoolUnauth_Role",
    IdentityPoolId: "us-east-1:77ed0cd0-2c84-4570-9b3d-fa968d4f279e"
};

var dx, dy, dz;

// console.log('MRAA Version: ' + MRAA.getVersion());

AWS.config.region = awsRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials(cognitoParams);
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: 'us-east-1:77ed0cd0-2c84-4570-9b3d-fa968d4f279e',
// });
AWS.config.credentials.get(function(err) {
    if (!err) {
        console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);
    }
    else console.log(err);
});

// var accelerometer = new LSM.LSM303(0);
var kinesis = new AWS.Kinesis();

setInterval(periodicActivity, 1000);

function periodicActivity() {
    // accelerometer.getCoordinates();
    // console.log("Xc " + accelerometer.getCoorX() + " Yc " + accelerometer.getCoorY() + " Zc " + accelerometer.getCoorZ());
    console.log('In period activity');
    var json = {
        device_id: deviceId,
        time: (new Date).getTime(),
        sensors: [
          (Math.random() * 30) + 60,
          (Math.random() * 30) + 60,
          (Math.random() * 30) + 60
        ]
    };

    var kparams = {
        Data: JSON.stringify(json),
        PartitionKey: partitionKey,
        StreamName: streamName
    };

    kinesis.putRecord(kparams, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(data);
        }
    });
}
