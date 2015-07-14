(function() {

	Access Key ID:
AKIAINJUFZJBSFMCTDEA
Secret Access Key:
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



	var roleArn = 'arn:aws:iam::555818481905:role/hackday-2014-team7/hackday-2014-team7-CognitoAuthRole-13GVJ526FAOGU', // IAM Role created
    	awsRegion = 'us-east-1',
    	streamName = 'hackday-2014-team7-TeamStream-1RPBD9N4UAQCZ'; // Kinesis stream that we'll use in this example

    document.write('<a id="itae-anchor" href="http://bit.ly/aws-iot"></a>');
    var anchor = document.getElementById('itae-anchor'),
        container = anchor.parentNode,
        viewport = document.createElement('div');
    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(anchor);
    container.appendChild(viewport);
    var style = window.getComputedStyle(container, null);
    anchor.style.position = 'absolute';
    anchor.style.width = viewport.style.width = style.width;
    anchor.style.height = viewport.style.height = style.height;
    anchor.style.zIndex = 1;
    anchor.style.zIndex = 0;
    viewport.style.overflow = 'hidden';
    var width = viewport.clientWidth,
        height = viewport.clientHeight,
        pan = Math.round(width / 200),
        totalWidth = pan * 1000,
        zero = height / 2,
        refreshRate = 100,
        threshold = 50;
    var x, y = zero,
        deflection = 0,
        axesPrev = [],
        canvas, ctx;
    var freshCanvas = function() {
        var newCanvas = document.createElement('canvas');
        newCanvas.width = totalWidth;
        newCanvas.height = height;
        viewport.appendChild(newCanvas);
        viewport.scrollLeft = 0;
        ctx = newCanvas.getContext('2d');
        ctx.strokeStyle = style.color;
        if (canvas) {
            ctx.drawImage(canvas, width - x, 0);
            viewport.removeChild(canvas);
        }
        canvas = newCanvas;
        x = width;
    };
    var scrollCanvas = function() {
        viewport.scrollLeft++;
        if (viewport.scrollLeft >= totalWidth - width) {
            freshCanvas();
        }
    };
    var drawTheLine = function() {
        ctx.beginPath();
        ctx.moveTo(x, y);
        x += pan;
        y = zero + (height * deflection / 25);
        deflection = Math.random() * .2 - .1;
        ctx.lineTo(x, y);
        ctx.stroke();
        for (var i = 0; i < pan; i++) {
            setTimeout(scrollCanvas, i * refreshRate / pan);
        }
    };
    var tilt = function(axes) {
        if (axesPrev) {
            for (var i = 0; i < axes.length; i++) {
                var delta = axes[i] - axesPrev[i];
                //if (Math.abs(delta) > Math.abs(deflection)) {
                    deflection = 5;
                //}
            }
        }
        axesPrev = axes;
    };
    var login = function() {

        var params = {
            AccountId: "555818481905",
            RoleArn: "arn:aws:iam::555818481905:role/hackday-2014-team7/hackday-2014-team7-CognitoAuthRole-13GVJ526FAOGU",
            IdentityPoolId: "us-east-1:12ba1e64-daac-4508-846e-587ce5485466"
        };

        // set the Amazon Cognito region
        AWS.config.region = awsRegion;
        // initialize the Credentials object with our parameters
        AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

        // We can set the get method of the Credentials object to retrieve
        // the unique identifier for the end user (identityId) once the provider
        // has refreshed itself
        AWS.config.credentials.get(function(err) {
            if (!err) {
                console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);
            }
        });
        kinesis = new AWS.Kinesis();
        getStream();
    };
    var getRecords = function(err, data) {
        if (err) {
            console.log(err);
            return;
        }

        kinesis.getRecords({
            ShardIterator: data.ShardIterator,
            Limit: 100
        }, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }

            // process the records, determine which series they are associated with
            // and add them to the Chart
            for (var record in data.Records) {
                /* Expected data record format { " values ": [ { " x ":
							<x-axis-value-XX>, " y ":
							    <y-axis-value>}, { " x ":
							        <x-axis-value-YY>, " y ":
							            <y-axis-value>}, { " x ":
							                <x-axis-value-ZZ>, " y ":
							                    <y-axis-value>} ... ], " key ": "
							                        < series - key - name>", } */



                console.log(data.Records[record].Data); // un-comment this to see the entire datum in the console

                //datum = JSON.parse(data.Records[record].Data);

                //decodedData = window.btoa(data.Records[record].Data);
                console.log(data.Records[record].Data.toString()); // un-comment this to see the entire datum in the console

                //datum = JSON.parse(decodedData);
				//console.log(datum); // un-comment this to see the entire datum in the console

            	tilt([10,10]);


            }



            // pass the iterator for the next batch
            // and wait 500 ms before getting records again
            setTimeout(function() {
            data.ShardIterator = data.NextShardIterator;
            getRecords(null, data);
            }, 50);
        });
    };
    var getStream = function() {
        kinesis.describeStream({
            StreamName: streamName
        }, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }
            /*if (_.size(data.StreamDescription.Shards > 1)) {
	                console.log('WARNING: this demo was designed to work with a single Kinesis shard');
	            }*/

            // now get the Stream's shardIterator and start getting records in a loop
            kinesis.getShardIterator({
                StreamName: streamName,
                ShardId: data.StreamDescription.Shards[0].ShardId,
                ShardIteratorType: 'LATEST'
            }, getRecords);
        });
    };



    login();


    freshCanvas();
    ctx.moveTo(0, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
            tilt([event.beta, event.gamma]);
        }, true);
    } else if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', function(event) {
            tilt([event.acceleration.x * 2, event.acceleration.y * 2]);
        }, true);
    } else {
        window.addEventListener('MozOrientation', function(orientation) {
            tilt([orientation.x * 50, orientation.y * 50]);
        }, true);
    }
    setInterval(drawTheLine, refreshRate);
})();
