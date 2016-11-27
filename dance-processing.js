function calculateBeats(movements) {

	movements = blurMovements(7, movements);
	movements = discretizeMovements(15, movements);

	if(movements.length < 50) return;

	var maxim = [];
	var minim = [];

	var prev_position = movements[0][1];
	var prev_time = movements[0][0];
	var direction = (movements[0][1] < movements[1][1] ? 1 : -1);

	for(var e = 1; e < movements.length; e++) {
		var time = movements[e][0];
		var position = movements[e][1];

		var diff = position - prev_position;

		if(diff > 5 && direction == -1) {
			direction = 1;
			minim.push([prev_time, prev_position ]);
		} else if(diff < -5 && direction == 1) {
			direction = -1;
			maxim.push([prev_time, prev_position]);
		}

		prev_position = position;
		prev_time = time;

	}

	return {
		max: maxim,
		min: minim
	}

}

function blurMovements(averageCount, movements) {
	var newMovements = [];
	for(var i = 0; i < movements.length - averageCount; i++) {
		var valueSum = 0;
		var timeSum = 0;
		for(var of = 0; of < averageCount; of++) {
			timeSum += movements[i+of][0];
			valueSum += movements[i+of][1];
		}
		newMovements.push([timeSum/averageCount, valueSum/averageCount])
	}

	return newMovements;
}

function discretizeMovements(bucketSize, movements) {
	var newMovements = [];
	for(var i = 0; i < movements.length; i++) {
		newMovements.push([movements[i][0], Math.floor(movements[i][1]/bucketSize)*bucketSize])
	}
	return newMovements;
}

function getBpm(movements) {
	var beats = calculateBeats(movements);
	if(!beats || beats.max.length < 2) return;

	// If no max are detected in 2 seconds it returns 0 bpm
	var times = [].concat(beats.min.map(function(val) {return val[0]}), beats.max.map(function(val) {return val[0]}));
	var maxTime = Math.max.apply(null, times);
	if(maxTime < new Date().getTime() - 2000) return 0;

	return 2 * beats.max.length / (slidingWindowSizeTime/ 60000);

}
