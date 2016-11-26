function calculateBeats(movements) {

	var maxim = [];
	var minim = [];

	var prev_position = movements[0][1];
	var prev_time = movements[0][0];
	var direction = (movements[0][1] < movements[1][1] ? 1 : -1);

	for(var e = 1; e < movements.length; e++) {
		var time = movements[e][0];
		var position = movements[e][1];

		var diff = position - prev_position;

		if(diff > 0 && direction == -1) {
			direction = 1;
			minim.push(prev_time + (time - prev_time) /2 );
		} else if(diff < 0 && direction == 1) {
			direction = -1;
			maxim.push(prev_time + (time - prev_time) /2 );
		}

		prev_position = position;
		prev_time = time;

	}

	return {
		max: maxim,
		min: minim
	}

}

function getBpm(movements) {
	var beats = calculateBeats(movements);
	return Math.floor(beats.max.length/2) / ((beats.max[beats.max.length - 1] - beats.max[0])/ 60);

}