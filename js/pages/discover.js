/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

(async () => {
	$(document).ready(function() {
		$(".games-list-container").draggable({
		  connectToSortable: ".horizontal-scroll-window",
		  helper: "clone",
		  revert: "invalid"
		});
	  });
})()