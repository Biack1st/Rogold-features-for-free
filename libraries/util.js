/*
	RoGold

	Coding and design by alexop1000 (AlexOp).
	Contact: https://rogold.me/invite

	Copyright (C) alexop1000 
	All rights reserved.
*/

let pages = {};

const addCommas = (num) => {
	num = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	if (num.indexOf(".") > 0) {
		num = num.replace(/\,/g, "");
	}
	return num;
}

const Fixed = (num, len) => {
	const str = String(num)
	const amt = len - str.length
	return amt > 0 ? "0".repeat(amt) + str : str
}
let DTF
const Months = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
]

const Days = [
	"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]
function dateFormat(date, format) {
	if (typeof date === "string") {
		date = new Date(date)
	}

	return format.replace(/a|A|Z|T|S(SS)?|ss?|mm?|HH?|hh?|D{1,4}|M{1,4}|YY(YY)?|'([^']|'')*'/g, str => {
		switch (str[0]) {
			case "'": return str.slice(1, -1).replace(/''/g, "'")
			case "a": return date.getHours() < 12 ? "am" : "pm"
			case "A": return date.getHours() < 12 ? "AM" : "PM"
			case "Z": return (("+" + -date.getTimezoneOffset() / 60).replace(/^\D?(\D)/, "$1").replace(/^(.)(.)$/, "$10$2") + "00")
			case "T":
				if (!DTF) { DTF = new Intl.DateTimeFormat("en-us", { timeZoneName: "short" }) }
				return DTF?.format(date)?.split(" ")[1]
			case "Y": return ("" + date.getFullYear()).slice(-str.length)
			case "M": return str.length > 2 ? Months[date.getMonth()].slice(0, str.length > 3 ? 9 : 3) : Fixed(date.getMonth() + 1, str.length)
			case "D": return str.length > 2 ? Days[date.getDay()].slice(0, str.length > 3 ? 9 : 3)
				: str.length === 2 ? Fixed(date.getDate(), 2) : date.getDate()
			case "H": return Fixed(date.getHours(), str.length)
			case "h": return Fixed(date.getHours() % 12 || 12, str.length)
			case "m": return Fixed(date.getMinutes(), str.length)
			case "s": return Fixed(date.getSeconds(), str.length)
			case "S": return Fixed(date.getMilliseconds(), str.length)
			default: return "dapoop?"
		}
	})
}
function dateSince(date, relativeTo, short = false) {
	if (relativeTo instanceof Date) {
		relativeTo = relativeTo.getTime()
	} else if (typeof relativeTo === "string") {
		relativeTo = new Date(relativeTo).getTime()
	} else if (!relativeTo) {
		relativeTo = Date.now()
	}

	if (date instanceof Date) {
		date = date.getTime()
	} else if (typeof date === "string") {
		date = new Date(date).getTime()
	}

	const since = (relativeTo - date) / 1000

	if (Math.floor(since) <= 0) {
		return "Just now"
	}

	const y = Math.floor(since / 3600 / 24 / 365)
	if (y >= 1) { return Math.floor(y) + (short ? " yr" : " year" + (y < 2 ? "" : "s")) + " ago" }

	const M = Math.floor(since / 3600 / 24 / 31)
	if (M >= 1) { return Math.floor(M) + (short ? " mon" : " month" + (M < 2 ? "" : "s")) + " ago" }

	const w = Math.floor(since / 3600 / 24 / 7)
	if (w >= 1) { return Math.floor(w) + (short ? " wk" : " week" + (w < 2 ? "" : "s")) + " ago" }

	const d = Math.floor(since / 3600 / 24)
	if (d >= 1) { return Math.floor(d) + (short ? " dy" : " day" + (d < 2 ? "" : "s")) + " ago" }

	const h = Math.floor(since / 3600)
	if (h >= 1) { return Math.floor(h) + (short ? " hr" : " hour" + (h < 2 ? "" : "s")) + " ago" }

	const m = Math.floor(since / 60)
	if (m >= 1) { return Math.floor(m) + (short ? " min" : " minute" + (m < 2 ? "" : "s")) + " ago" }

	const s = Math.floor(since)
	return Math.floor(s) + (short ? " sec" : " second" + (Math.floor(s) === 1 ? "" : "s")) + " ago"
}
var is_chrome = ((navigator.userAgent.toLowerCase().indexOf('chrome') > -1) && (navigator.vendor.toLowerCase().indexOf("google") > -1));
let browserTop = is_chrome && chrome || browser
let is_firefox = (navigator.userAgent.toLowerCase().indexOf("firefox") != -1)
function get(url) {
	return new Promise(resolve => {
		browserTop.runtime.sendMessage({ greeting: "GetURL", url: url }, resolve)
		// .catch(() => {
		// 	fetch(url).then(res => res.json()).then(res => resolve(res))
		// })
	})
}
function browserSend(greeting, info) {
	return new Promise(resolve => {
		browserTop.runtime.sendMessage({ greeting: greeting, info: info }, resolve)
	})
}
function syncGet(index, callback) {
	if (is_chrome) {
		browserTop.storage.sync.get(index, callback)
	} else {
		browserTop.storage.sync.get(index).then(callback)
	}
}
const pGetStorage = async (index) => {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(index, (result) => {
			resolve(result[index]);
		});
	});
}
const syncSet = (index, value) => {
	let toSet = {}
	toSet[index] = value
	browserTop.storage.sync.set(toSet)
}
async function postRepeat(request, options, max = 2, current = 1) {
	return new Promise(async (resolve, reject) => {
		fetch(request, {
			method: options.type || 'POST',
			headers: options.headers || {
				"Content-Type": "application/json",
				"X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token')
			},
			body: options.data || "",
			credentials: "include"
		}).then(async (response) => {
			if (response.status === 200) {
				resolve(await response.json())
			} else if (response.status === 429) {
				if (current < max) {
					await sleep(1000)
					postRepeat(request, options, max, current + 1).then(resolve, reject)
				} else {
					reject(response)
				}
			} else {
				reject(response)
			}
		}).catch(reject)
	})
}
// async function setTimeout(callback, delay) {
// 	$({to: 0}).animate({to: 1}, delay, callback)
// }
async function observe(element, name, callback, once, exact = false) {
	let did = false
	const checkNode = async (added_node) => {
		if (once && did || !added_node) {
			return
		}
		const doContinue = async () => {
			did = true
			callback(added_node, observer)
			if (once) {
				observer.disconnect()
			}
		}
		if (Array.isArray(name)) {
			if (!exact) {
				for (const oName of name) {
					try {
						if (added_node.className && added_node.className.includes && added_node.className.includes(oName)) {
							doContinue()
							break
						}
					} catch (error) {
						//console.log(error);
					}
				}
			} else {
				if (name.includes(added_node.className)) doContinue();
			}
		} else {
			if (!exact) {
				if (added_node.className == name) doContinue();
			} else {
				if (added_node.className.includes(name)) doContinue();
			}
		}
	}
	const observer = new MutationObserver(async function (mutations_list) {
		mutations_list.forEach(async function (mutation) {
			mutation.addedNodes.forEach(async function (added_node) {
				checkNode(added_node)
			})
		})
	})
	observer.observe(element, { subtree: true, childList: true });
	if ((!Array.isArray(name) && element.getElementsByClassName(name)[0])) {
		for (const op of element.getElementsByClassName(name)) {
			checkNode(op)
			if (once) {
				break
			}
		}
	} else if (Array.isArray(name)) {
		for (const el of name) {
			for (const op of element.getElementsByClassName(el)) {
				checkNode(op)
				if (once) {
					break
				}
			}
		}
	}
}

const editDistance = (a, b) => {
	a = a.toLowerCase()
	b = b.toLowerCase()
	let v0 = [];
	let v1 = [];
	for (let i = 0; i < b.length + 1; i++) {
		v0[i] = i;
	}
	for (let i = 1; i <= a.length; i++) {
		v1[0] = i;
		for (let j = 1; j <= b.length; j++) {
			let cost = a[i - 1] === b[j - 1] ? 0 : 1;
			v1[j] = Math.min(v1[j - 1] + 1, v0[j] + 1, v0[j - 1] + cost);
		}
		for (let j = 0; j < v0.length; j++) {
			v0[j] = v1[j];
		}
	}
	return v1[b.length];
}

const similarity = (a, b) => {
	if (a === b) return 1;
	if (a.length === 0 || b.length === 0) return 0;
	return 1 - editDistance(a, b) / Math.max(a.length, b.length)
}

const getId = (href) => {
	return href.match(/(\d+)/g)[0]
}
const defaultSettings = {
	"Basic": {
		"Home Greeting": {
			type: "dropdown",
			default: "Dynamic",
			description: "Greeting message on the home page.",
			options: [
				"Off",
				"Welcome",
				"Hello",
				"Dynamic",
			],
		},
		"More Group Stats": {
			type: "toggle",
			description: "This will toggle the ability to see more detailed group stats.",
			default: true
		},
		"Quick Copy": {
			type: "toggle",
			description: "Adds the abillity to easily copy Roblox ids in the browser Context Menu.",
			default: true
		},
		"Navigation Buttons": {
			type: "toggle",
			description: "Get extra buttons on the navigation menu (Transactions, Redeem).",
			default: true
		},
		"Theme Creator": {
			type: "multi",
			description: "Use the given themes or create your own to use on the site.",
			default: [false, "Gold", "Banana"],
			beta: true,
			options: [
				{
					section: "Color Themes",
					list: {
						Gold: { info: { "background-color": "#daa520" }, style: "gold-theme" },
						Green: { info: { "background-color": "#2e8b57" }, style: "green-theme" },
						DarkBlue: { info: { "background-color": "#2c8bbd" }, style: "dark-blue-theme" },
						DarkGray: { info: { "background-color": "#585858" }, style: "dark-gray-theme" },
						DarkGreen: { info: { "background-color": "#007800" }, style: "dark-green-theme" },
						LightBlue: { info: { "background-color": "#000080" }, style: "light-blue-theme" },
						DarkRed: { info: { "background-color": "#8b0000" }, style: "dark-red-theme" },
						Yellow: { info: { "background-color": "#d4bd00" }, style: "yellow-theme" },
						LightGray: { info: { "background-color": "#c0c0c0" }, style: "light-gray-theme" },
						Blue: { info: { "background-color": "#0076a3" }, style: "blue-theme" },
						LightGreen: { info: { "background-color": "#006633" }, style: "light-green-theme" },
					}
				},
				{
					section: "Image Themes",
					list: {
						Banana: { colors: "DarkGray", styling: { "background-image": "bananas.png" } },
						Snow: { colors: "DarkGray", styling: { "background-image": "blue-snow.png" } },
						DarkPaths: { colors: "DarkGray", styling: { "background-image": "dark-paths.png" } },
						EmbossedDiamond: { colors: "DarkGray", styling: { "background-image": "embossed-diamond.png" } },
						FolkPattern: { colors: "DarkGray", styling: { "background-image": "folk-pattern-black.png" } },
						Sun: { colors: "DarkGray", styling: { "background-image": "let-there-be-sun.png" } },
						OrientalTiles: { colors: "DarkGray", styling: { "background-image": "oriental-tiles.png" } },
						Prism: { colors: "DarkGray", styling: { "background-image": "prism.png" } },
						ChristmasDark: { colors: "DarkGray", styling: { "background-image": "christmas-dark.png" } },
						Christmas: { colors: "DarkGray", styling: { "background-image": "christmas-colour.png" } },
						Terrazzo: { colors: "DarkGray", styling: { "background-image": "dark-grey-terrazzo.png" } },
					},
					text: "Background patterns from Toptal Subtle Patterns"
				},
				{
					section: "Custom Theme",
					list: {
						"Background Color": { cf: true, sel: "#rbx-body" },
						"Header Color": { cf: true, sel: "#header" },
						"Background Image": { fu: true, txt: "Select Image", sel: "#rbx-body" },
						"Navigation Color": { cf: true, sel: "#navigation" },
						"Text Color": { cf: true, sel: "*", prop: "color" },
						"BG IMG Blend Mode": { sel: "#rbx-body", prop: "background-blend-mode", options: ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"] },
						"BG Repeat": { sel: "#rbx-body", prop: "background-repeat", options: ["repeat", "repeat-x", "repeat-y", "no-repeat", "round", "space"] },
					},
					text: "Reset by setting to #FFFFFF"
				}
			]
		},
		"Group Wall Replies": {
			type: "toggle",
			description: "This will toggle the ability to see and create replies on a group wall. (If message isn't filtered)",
			default: true,
			beta: true
		},
		"Home Favorites": {
			type: "toggle",
			description: "See and access your different favorites on the home page.",
			default: true,
		},
		"Bulk Unfriend": {
			type: "toggle",
			description: "Unfriend multiple people at once.",
			default: true,
		},
		"Best Friends": {
			type: "toggle",
			description: "See your best friends on the home page. (You can select them on your friends list.)",
			default: true,
		},
		"Keep Sidebar Open": {
			type: "toggle",
			description: "Keeps the sidebar open even with smaller screen sizes.",
			default: false,
		},
		"Streamer Mode": {
			type: "toggle",
			default: false,
			description: `Hide your Robux, name and more! (Toggle with the keyboard shortcut CTRL+SHIFT+1)`,
			beta: true
		},
		"Message Scam Protection": {
			type: "toggle",
			description: "Scan through messages highlighting those that seem suspicious or dangerous (with a red color).",
			default: true,
			beta: true,
		},
	},
	"Catalog": {
		"Random Accessory Finder": {
			type: "toggle",
			description: "This will add a button to the catalog that will allow you to find a random accessory.",
			default: true,
			beta: true
		},
		"More Item Stats": {
			type: "toggle",
			description: "See more stats for items in the catalog (Owners, hoarded, avg daily sales...).",
			default: true,
			beta: true
		},
	},
	"Profiles": {
		// "Detailed Player Stats": {
		// 	type: "dropdown",
		// 	default: "Speed",
		// 	description: "Controls if you prioritize the extension to load it fast or accurately (Disabled by default when using BTRoblox).",
		// 	options: [
		// 		"Speed",
		// 		"Accuracy"
		// 	]
		// },
		"Show RAP": {
			type: "toggle",
			description: "This will toggle the ability to see RAP and collectibles on a players page.",
			default: true
		},
		"View Banned Users": {
			type: "toggle",
			default: true,
			description: `View banned users profiles. To use this go to <a class="text-link" target="_blank" rel="noopener" href="/banned-users/">https://www.roblox.com/banned-users/</a> adding a userid/username of a banned user at the end.`,
		},
		"Outfit Copier": {
			type: "toggle",
			default: true,
			description: `View and copy the outfits of other users. To use this go to <a class="text-link" target="_blank" rel="noopener" href="/outfit-copier/">https://www.roblox.com/outfit-copier/</a>`,
			beta: true
		},
	},
	"Games": {
		"Pinned Games": {
			type: "toggle",
			description: "This will toggle the ability to pin games.",
			default: true
		},
		"Live Game Stats": {
			type: "dropdown",
			default: "10 Seconds",
			description: "Updates the page stats every x seconds.",
			options: [
				"Off",
				"5 Seconds",
				"10 Seconds",
				"20 Seconds"
			]
		},
		"Server Join Link": {
			type: "toggle",
			description: "Copy a joinable server link. This link will only work for RoGold users.",
			default: true
		},
		"Easy Joins": {
			type: "toggle",
			description: "Toggle the buttons to quickly join empty / faster servers.",
			default: true
		},
		"Better Badges": {
			type: "toggle",
			description: "Toggle the ability to see info about when you unlocked a badge on the game page. (And hidden badges)",
			default: true
		},
	},
	"Currency": {
		"Robux Convert": {
			type: "dropdown",
			default: "USD",
			description: "Allows you to configure different types of currency amounts the Robux is equal to (Shown next to Robux amounts).",
			options: [
				"Off",
				"Custom",
				"USD",
				"AUD",
				"GBP",
				"EUR",
				"JPY",
				"DKK",
				"MYR"
			],
			beta: true
		},
		"Robux Convert Custom": {
			type: "input",
			need: { "Robux Convert": "Custom" },
			description: "e.g. CAD",
			characters: 3
		},
		"Conversion Rate": {
			type: "dropdown",
			default: "Normal",
			description: "Configure which conversion rate to use.",
			options: [
				"Normal",
				"DevEx",
				"Premium",
			]
		},
		"Abbreviate Robux": {
			type: "toggle",
			description: "This will abbreviate Robux counts where applicable.",
			default: false
		}
	},
	"Development": {
		"DevHub Search": {
			type: "toggle",
			description: "This will toggle the ability to search the Developer Hub from the Roblox search bar.",
			default: true
		},
		"Bulk Upload": {
			type: "dropdown",
			default: "Decals",
			description: "Controls which type of bulk upload you will allow.",
			options: [
				// "All",
				// "T-Shirts",
				// "Shirts",
				// "Pants",
				"Decals",
				"None"
			]
		},
		"Better Styling": {
			type: "toggle",
			description: "This will toggle the ability to see the better styling of the developing pages. (Also dark mode)",
			default: true
		},
	},
	"Experimental": {
		"Original Finder": {
			type: "toggle",
			default: false,
			description: `Allows you to find the original clothing. Under heavy construction. Might be slow / disfunctional at times.`,
			experimental: true,
		},
		"Quick User Search": {
			type: "toggle",
			description: "Adds the ability to quickly find roblox users in the search bar.",
			default: false,
			experimental: true,
		},
		"Library Analysis": {
			type: "toggle",
			description: "Analyze library models and plugins to see what content they contain as well as how safe they are. This does not work correctly with files encoded in binary yet.",
			default: false,
			experimental: true,
		},
		"View Locked Groups": {
			type: "toggle",
			description: "This will toggle the ability to view locked groups. (Not close to finished. You view it by going to a group that is locked)",
			default: false,
			experimental: true
		}
	},
};

const getSetting = (setting) => {
	return new Promise((resolve, reject) => {
		syncGet("settings", (response) => {
			let settings = response.settings || {}
			if (settings[setting] == null) {
				Object.keys(defaultSettings).forEach(async (category) => {
					if (defaultSettings[category][setting]) resolve(defaultSettings[category][setting].default);
				})
			} else {
				resolve(settings[setting])
			}
		})
	})
}
const setSetting = (setting, value) => {
	return new Promise((resolve, reject) => {
		syncGet("settings", (response) => {
			let settings = response.settings || {}
			settings[setting] = value
			browserTop.storage.sync.set({ settings: settings })
			resolve()
		})
	})
}
const removeDublicates = (str) => {
	return [...new Set(str.split(" "))].join(" ")
}
const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g


const NumberFormatting = (() => {
	return {
		abbreviatedFormat: (number) => {
			if (typeof number != "number") {
				return number;
			}
			if (number < 1e3) {
				return number;
			}
			const ending = ["K+", "M+", "B+"]
			const endingIndex = Math.floor(Math.log10(number) / 3)
			return Math.floor(number / Math.pow(1e3, endingIndex)) + ending[endingIndex - 1]
		}
	}
})()

const animating = {}
function animateResultCount(number, target, elem, animationDuration, onStep) {
	if (number == target) return;
	if (animating[elem] != null) {
		clearInterval(animating[elem])
	}
	let loops = animationDuration / 60
	let increment = (target - number) / loops
	let frame = 0
	var interval = setInterval(() => {
		frame++
		number += Math.round(increment)
		if (onStep) { onStep(number) } else elem.innerHTML = addCommas(number);
		if (frame >= loops) {
			clearInterval(interval);
			if (onStep) { onStep(target); } else elem.innerHTML = addCommas(target);
		}
	}, 60);
	elem.setAttribute("title", addCommas(target))
	if (onStep) { onStep(number) } else elem.innerHTML = addCommas(number);
	animating[elem] = interval
}
const splitLimit = async (array, callback, joiner, size = 30) => {
	return new Promise(async resolve => {
		const returns = [];
		var arrayOfArrays = [];
		for (var i = 0; i < array.length; i += size) {
			arrayOfArrays.push(array.slice(i, i + size));
		}
		for (const content of arrayOfArrays) {
			let edit = content.map(e => e).join(joiner)
			for (const got of await callback(edit)) {
				returns.push(got)
			}
		}
		resolve(returns)
	})
}
let cachedUserId
const checkExperiments = async () => {
	return new Promise(async resolve => {
		if (!cachedUserId) {
			let userId = await get(`https://users.roblox.com/v1/users/authenticated`)
			userId = userId.id
			cachedUserId = userId
		}
		let bool = await get(`https://inventory.roblox.com/v1/users/2912889898/items/GamePass/21576212`) // no change plz lol just buy it helps out a lot
		if (bool) { bool = bool?.data?.[0] }
		resolve(bool)
	})
}
let cachedValues = {}
const doCache = async (index, toGet, timeout) => {
	return new Promise(async resolve => {
        if (toGet === null){
            resolve(null)
            return
        }
		cachedValues[index] = {
			time: Date.now() + timeout,
			value: await toGet()
		}
		await browserSend("CacheValue", { key: index, value: cachedValues[index] })
		resolve(cachedValues[index].value)
	})
}
const cacheValue = async (index, toGet, timeout) => {
	return new Promise(async resolve => {
		if (!cachedValues[index]) {
			cachedValues[index] = await browserSend("GetCacheValue", { key: index })
		}
        if (!toGet && !cachedValues[index]) resolve(null);
		if (!cachedValues[index]) {
			resolve(await doCache(index, toGet, timeout))
			return
		}
		if ((Date.now() - cachedValues[index].time) < timeout) {
			resolve(cachedValues[index].value)
		} else {
            if (!toGet) resolve(null);
			resolve(await doCache(index, toGet, timeout));
		}
	})
}
const getUserId = async () => {
	return Promise.resolve(cacheValue("userId", () => {
			return new Promise(async resolve => {
				let userId = await get(`https://users.roblox.com/v1/users/authenticated`)
				userId = userId.id
				resolve(userId)
			})
		}, 1000 * 60))
}
function stripTags(s) { // use on all input
	return s.replace(/(<([^>]+)>)/gi, "");
}
const progressRequest = async (url, max = 10, begin = 1, callback, cursor = "", current = 1) => {
	let resp = await get(url + "&cursor=" + cursor)
	if (current >= begin) {
		await callback(resp, current)
	}
	if (resp.nextPageCursor && current < max) {
		progressRequest(url, max, begin, callback, resp.nextPageCursor, current + 1)
	}
}
if (typeof Element.prototype.clearChildren === 'undefined') {
	Object.defineProperty(Element.prototype, 'clearChildren', {
		configurable: true,
		enumerable: false,
		value: function () {
			while (this.firstChild) this.removeChild(this.lastChild);
		}
	});
}
// Call a function every time an element with selector is found
const on = async (selector, callback) => {
    const finished = [];
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const found = document.querySelectorAll(selector);
                for (let i = 0; i < found.length; i++) {
                    if (!finished.includes(found[i])) {
                        finished.push(found[i]);
                        callback(found[i], i);
                    }
                }
            }
        });
    });
    observer.observe(document, { childList: true, subtree: true });
    find(selector).then((found) => {
        for (let i = 0; i < found.length; i++) {
            if (!finished.includes(found[i])) {
                finished.push(found[i]);
                callback(found[i], i);
            }
        }
    });
};

function decapitalize(string) {
	return string.toLowerCase().split(' ').map(function (word) {
		return word[0];
	}).join('');
}
const awaitReady = async () => {
	return new Promise(resolve => { // Stupid way to make firefox support
		const timeout = setTimeout(() => {
			resolve()
		}, 2000)
		const resolver = () => {
			clearTimeout(timeout)
			resolve()
		}
		document.addEventListener("DOMContentLoaded", resolver)
		$(document).ready(resolver)
	})
}
const imgNone = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJ1bmFwcHJvdmVkXzFfIj48cGF0aCBpZD0iYmdfMl8iIGZpbGw9IiM2NTY2NjgiIGQ9Ik0wIDBoOTB2OTBIMHoiLz48ZyBpZD0idW5hcHByb3ZlZCIgb3BhY2l0eT0iLjMiPjxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjQ1IiBjeT0iNDguOCIgcj0iMTAiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNMzggNDEuN2wxNCAxNC4xTTMyLjUgMjMuNWgtNHY0TTI4LjUgNjIuNXY0aDRNMjguNSAzMS44djZNMjguNSA0MnY2TTI4LjUgNTIuMnY2TTU3LjUgNjYuNWg0di00TTYxLjUgNTguMnYtNk02MS41IDQ4di02TTYxLjUgMzcuOHYtNE0zNi44IDY2LjVoNk00Ny4yIDY2LjVoNk0zNi44IDIzLjVoNk00Ny4yIDIzLjVoNE01MS40IDIzLjZsMy41IDMuNU01Ny45IDMwLjFsMy41IDMuNU01MS4yIDIzLjh2M001OC41IDMzLjhoM001MS4yIDMwLjJ2My42aDMuNiIvPjwvZz48L2c+PC9zdmc+"
const bulkTry = async (location, amount = 7, current = 0) => {
	return new Promise((resolve, reject) => {
		const t = [...location].reduce((lastCode, char) => lastCode ^ char.charCodeAt(0), 31)
		get(`https://t${t % 8}.rbxcdn.com/${location}`).then((resp) => {
			resolve({ result: resp, url: `https://t${current}.rbxcdn.com/${location}` })
		})
	})
}
const find = async (selector) => {
	const found = document.querySelectorAll(selector);
	if (found.length && found.length > 0) {
		return found;
	}
	return new Promise((resolve) => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes.length) {
					const found = document.querySelectorAll(selector);
					if (found.length && found.length > 0) {
						observer.disconnect();
						resolve(found);
					}
				}
			});
		});
		observer.observe(document, { childList: true, subtree: true });
	});
};

// Get the first element using the find function and a selector string
const first = async (selector, then) => {
    return new Promise(async resolve => {
        const found = await find(selector);
        if (then) then(found[0]);
        resolve(found[0]);
    })
};
// Remove weird characters from html
let entities = { "&AElig": "Æ", "&AElig;": "Æ", "&AMP": "&", "&AMP;": "&", "&Aacute": "Á", "&Aacute;": "Á", "&Abreve;": "Ă", "&Acirc": "Â", "&Acirc;": "Â", "&Acy;": "А", "&Afr;": "𝔄", "&Agrave": "À", "&Agrave;": "À", "&Alpha;": "Α", "&Amacr;": "Ā", "&And;": "⩓", "&Aogon;": "Ą", "&Aopf;": "𝔸", "&ApplyFunction;": "⁡", "&Aring": "Å", "&Aring;": "Å", "&Ascr;": "𝒜", "&Assign;": "≔", "&Atilde": "Ã", "&Atilde;": "Ã", "&Auml": "Ä", "&Auml;": "Ä", "&Backslash;": "∖", "&Barv;": "⫧", "&Barwed;": "⌆", "&Bcy;": "Б", "&Because;": "∵", "&Bernoullis;": "ℬ", "&Beta;": "Β", "&Bfr;": "𝔅", "&Bopf;": "𝔹", "&Breve;": "˘", "&Bscr;": "ℬ", "&Bumpeq;": "≎", "&CHcy;": "Ч", "&COPY": "©", "&COPY;": "©", "&Cacute;": "Ć", "&Cap;": "⋒", "&CapitalDifferentialD;": "ⅅ", "&Cayleys;": "ℭ", "&Ccaron;": "Č", "&Ccedil": "Ç", "&Ccedil;": "Ç", "&Ccirc;": "Ĉ", "&Cconint;": "∰", "&Cdot;": "Ċ", "&Cedilla;": "¸", "&CenterDot;": "·", "&Cfr;": "ℭ", "&Chi;": "Χ", "&CircleDot;": "⊙", "&CircleMinus;": "⊖", "&CirclePlus;": "⊕", "&CircleTimes;": "⊗", "&ClockwiseContourIntegral;": "∲", "&CloseCurlyDoubleQuote;": "”", "&CloseCurlyQuote;": "’", "&Colon;": "∷", "&Colone;": "⩴", "&Congruent;": "≡", "&Conint;": "∯", "&ContourIntegral;": "∮", "&Copf;": "ℂ", "&Coproduct;": "∐", "&CounterClockwiseContourIntegral;": "∳", "&Cross;": "⨯", "&Cscr;": "𝒞", "&Cup;": "⋓", "&CupCap;": "≍", "&DD;": "ⅅ", "&DDotrahd;": "⤑", "&DJcy;": "Ђ", "&DScy;": "Ѕ", "&DZcy;": "Џ", "&Dagger;": "‡", "&Darr;": "↡", "&Dashv;": "⫤", "&Dcaron;": "Ď", "&Dcy;": "Д", "&Del;": "∇", "&Delta;": "Δ", "&Dfr;": "𝔇", "&DiacriticalAcute;": "´", "&DiacriticalDot;": "˙", "&DiacriticalDoubleAcute;": "˝", "&DiacriticalGrave;": "`", "&DiacriticalTilde;": "˜", "&Diamond;": "⋄", "&DifferentialD;": "ⅆ", "&Dopf;": "𝔻", "&Dot;": "¨", "&DotDot;": "⃜", "&DotEqual;": "≐", "&DoubleContourIntegral;": "∯", "&DoubleDot;": "¨", "&DoubleDownArrow;": "⇓", "&DoubleLeftArrow;": "⇐", "&DoubleLeftRightArrow;": "⇔", "&DoubleLeftTee;": "⫤", "&DoubleLongLeftArrow;": "⟸", "&DoubleLongLeftRightArrow;": "⟺", "&DoubleLongRightArrow;": "⟹", "&DoubleRightArrow;": "⇒", "&DoubleRightTee;": "⊨", "&DoubleUpArrow;": "⇑", "&DoubleUpDownArrow;": "⇕", "&DoubleVerticalBar;": "∥", "&DownArrow;": "↓", "&DownArrowBar;": "⤓", "&DownArrowUpArrow;": "⇵", "&DownBreve;": "̑", "&DownLeftRightVector;": "⥐", "&DownLeftTeeVector;": "⥞", "&DownLeftVector;": "↽", "&DownLeftVectorBar;": "⥖", "&DownRightTeeVector;": "⥟", "&DownRightVector;": "⇁", "&DownRightVectorBar;": "⥗", "&DownTee;": "⊤", "&DownTeeArrow;": "↧", "&Downarrow;": "⇓", "&Dscr;": "𝒟", "&Dstrok;": "Đ", "&ENG;": "Ŋ", "&ETH": "Ð", "&ETH;": "Ð", "&Eacute": "É", "&Eacute;": "É", "&Ecaron;": "Ě", "&Ecirc": "Ê", "&Ecirc;": "Ê", "&Ecy;": "Э", "&Edot;": "Ė", "&Efr;": "𝔈", "&Egrave": "È", "&Egrave;": "È", "&Element;": "∈", "&Emacr;": "Ē", "&EmptySmallSquare;": "◻", "&EmptyVerySmallSquare;": "▫", "&Eogon;": "Ę", "&Eopf;": "𝔼", "&Epsilon;": "Ε", "&Equal;": "⩵", "&EqualTilde;": "≂", "&Equilibrium;": "⇌", "&Escr;": "ℰ", "&Esim;": "⩳", "&Eta;": "Η", "&Euml": "Ë", "&Euml;": "Ë", "&Exists;": "∃", "&ExponentialE;": "ⅇ", "&Fcy;": "Ф", "&Ffr;": "𝔉", "&FilledSmallSquare;": "◼", "&FilledVerySmallSquare;": "▪", "&Fopf;": "𝔽", "&ForAll;": "∀", "&Fouriertrf;": "ℱ", "&Fscr;": "ℱ", "&GJcy;": "Ѓ", "&GT": ">", "&GT;": ">", "&Gamma;": "Γ", "&Gammad;": "Ϝ", "&Gbreve;": "Ğ", "&Gcedil;": "Ģ", "&Gcirc;": "Ĝ", "&Gcy;": "Г", "&Gdot;": "Ġ", "&Gfr;": "𝔊", "&Gg;": "⋙", "&Gopf;": "𝔾", "&GreaterEqual;": "≥", "&GreaterEqualLess;": "⋛", "&GreaterFullEqual;": "≧", "&GreaterGreater;": "⪢", "&GreaterLess;": "≷", "&GreaterSlantEqual;": "⩾", "&GreaterTilde;": "≳", "&Gscr;": "𝒢", "&Gt;": "≫", "&HARDcy;": "Ъ", "&Hacek;": "ˇ", "&Hat;": "^", "&Hcirc;": "Ĥ", "&Hfr;": "ℌ", "&HilbertSpace;": "ℋ", "&Hopf;": "ℍ", "&HorizontalLine;": "─", "&Hscr;": "ℋ", "&Hstrok;": "Ħ", "&HumpDownHump;": "≎", "&HumpEqual;": "≏", "&IEcy;": "Е", "&IJlig;": "Ĳ", "&IOcy;": "Ё", "&Iacute": "Í", "&Iacute;": "Í", "&Icirc": "Î", "&Icirc;": "Î", "&Icy;": "И", "&Idot;": "İ", "&Ifr;": "ℑ", "&Igrave": "Ì", "&Igrave;": "Ì", "&Im;": "ℑ", "&Imacr;": "Ī", "&ImaginaryI;": "ⅈ", "&Implies;": "⇒", "&Int;": "∬", "&Integral;": "∫", "&Intersection;": "⋂", "&InvisibleComma;": "⁣", "&InvisibleTimes;": "⁢", "&Iogon;": "Į", "&Iopf;": "𝕀", "&Iota;": "Ι", "&Iscr;": "ℐ", "&Itilde;": "Ĩ", "&Iukcy;": "І", "&Iuml": "Ï", "&Iuml;": "Ï", "&Jcirc;": "Ĵ", "&Jcy;": "Й", "&Jfr;": "𝔍", "&Jopf;": "𝕁", "&Jscr;": "𝒥", "&Jsercy;": "Ј", "&Jukcy;": "Є", "&KHcy;": "Х", "&KJcy;": "Ќ", "&Kappa;": "Κ", "&Kcedil;": "Ķ", "&Kcy;": "К", "&Kfr;": "𝔎", "&Kopf;": "𝕂", "&Kscr;": "𝒦", "&LJcy;": "Љ", "&LT": "<", "&LT;": "<", "&Lacute;": "Ĺ", "&Lambda;": "Λ", "&Lang;": "⟪", "&Laplacetrf;": "ℒ", "&Larr;": "↞", "&Lcaron;": "Ľ", "&Lcedil;": "Ļ", "&Lcy;": "Л", "&LeftAngleBracket;": "⟨", "&LeftArrow;": "←", "&LeftArrowBar;": "⇤", "&LeftArrowRightArrow;": "⇆", "&LeftCeiling;": "⌈", "&LeftDoubleBracket;": "⟦", "&LeftDownTeeVector;": "⥡", "&LeftDownVector;": "⇃", "&LeftDownVectorBar;": "⥙", "&LeftFloor;": "⌊", "&LeftRightArrow;": "↔", "&LeftRightVector;": "⥎", "&LeftTee;": "⊣", "&LeftTeeArrow;": "↤", "&LeftTeeVector;": "⥚", "&LeftTriangle;": "⊲", "&LeftTriangleBar;": "⧏", "&LeftTriangleEqual;": "⊴", "&LeftUpDownVector;": "⥑", "&LeftUpTeeVector;": "⥠", "&LeftUpVector;": "↿", "&LeftUpVectorBar;": "⥘", "&LeftVector;": "↼", "&LeftVectorBar;": "⥒", "&Leftarrow;": "⇐", "&Leftrightarrow;": "⇔", "&LessEqualGreater;": "⋚", "&LessFullEqual;": "≦", "&LessGreater;": "≶", "&LessLess;": "⪡", "&LessSlantEqual;": "⩽", "&LessTilde;": "≲", "&Lfr;": "𝔏", "&Ll;": "⋘", "&Lleftarrow;": "⇚", "&Lmidot;": "Ŀ", "&LongLeftArrow;": "⟵", "&LongLeftRightArrow;": "⟷", "&LongRightArrow;": "⟶", "&Longleftarrow;": "⟸", "&Longleftrightarrow;": "⟺", "&Longrightarrow;": "⟹", "&Lopf;": "𝕃", "&LowerLeftArrow;": "↙", "&LowerRightArrow;": "↘", "&Lscr;": "ℒ", "&Lsh;": "↰", "&Lstrok;": "Ł", "&Lt;": "≪", "&Map;": "⤅", "&Mcy;": "М", "&MediumSpace;": " ", "&Mellintrf;": "ℳ", "&Mfr;": "𝔐", "&MinusPlus;": "∓", "&Mopf;": "𝕄", "&Mscr;": "ℳ", "&Mu;": "Μ", "&NJcy;": "Њ", "&Nacute;": "Ń", "&Ncaron;": "Ň", "&Ncedil;": "Ņ", "&Ncy;": "Н", "&NegativeMediumSpace;": "​", "&NegativeThickSpace;": "​", "&NegativeThinSpace;": "​", "&NegativeVeryThinSpace;": "​", "&NestedGreaterGreater;": "≫", "&NestedLessLess;": "≪", "&NewLine;": "\n", "&Nfr;": "𝔑", "&NoBreak;": "⁠", "&NonBreakingSpace;": " ", "&Nopf;": "ℕ", "&Not;": "⫬", "&NotCongruent;": "≢", "&NotCupCap;": "≭", "&NotDoubleVerticalBar;": "∦", "&NotElement;": "∉", "&NotEqual;": "≠", "&NotEqualTilde;": "≂̸", "&NotExists;": "∄", "&NotGreater;": "≯", "&NotGreaterEqual;": "≱", "&NotGreaterFullEqual;": "≧̸", "&NotGreaterGreater;": "≫̸", "&NotGreaterLess;": "≹", "&NotGreaterSlantEqual;": "⩾̸", "&NotGreaterTilde;": "≵", "&NotHumpDownHump;": "≎̸", "&NotHumpEqual;": "≏̸", "&NotLeftTriangle;": "⋪", "&NotLeftTriangleBar;": "⧏̸", "&NotLeftTriangleEqual;": "⋬", "&NotLess;": "≮", "&NotLessEqual;": "≰", "&NotLessGreater;": "≸", "&NotLessLess;": "≪̸", "&NotLessSlantEqual;": "⩽̸", "&NotLessTilde;": "≴", "&NotNestedGreaterGreater;": "⪢̸", "&NotNestedLessLess;": "⪡̸", "&NotPrecedes;": "⊀", "&NotPrecedesEqual;": "⪯̸", "&NotPrecedesSlantEqual;": "⋠", "&NotReverseElement;": "∌", "&NotRightTriangle;": "⋫", "&NotRightTriangleBar;": "⧐̸", "&NotRightTriangleEqual;": "⋭", "&NotSquareSubset;": "⊏̸", "&NotSquareSubsetEqual;": "⋢", "&NotSquareSuperset;": "⊐̸", "&NotSquareSupersetEqual;": "⋣", "&NotSubset;": "⊂⃒", "&NotSubsetEqual;": "⊈", "&NotSucceeds;": "⊁", "&NotSucceedsEqual;": "⪰̸", "&NotSucceedsSlantEqual;": "⋡", "&NotSucceedsTilde;": "≿̸", "&NotSuperset;": "⊃⃒", "&NotSupersetEqual;": "⊉", "&NotTilde;": "≁", "&NotTildeEqual;": "≄", "&NotTildeFullEqual;": "≇", "&NotTildeTilde;": "≉", "&NotVerticalBar;": "∤", "&Nscr;": "𝒩", "&Ntilde": "Ñ", "&Ntilde;": "Ñ", "&Nu;": "Ν", "&OElig;": "Œ", "&Oacute": "Ó", "&Oacute;": "Ó", "&Ocirc": "Ô", "&Ocirc;": "Ô", "&Ocy;": "О", "&Odblac;": "Ő", "&Ofr;": "𝔒", "&Ograve": "Ò", "&Ograve;": "Ò", "&Omacr;": "Ō", "&Omega;": "Ω", "&Omicron;": "Ο", "&Oopf;": "𝕆", "&OpenCurlyDoubleQuote;": "“", "&OpenCurlyQuote;": "‘", "&Or;": "⩔", "&Oscr;": "𝒪", "&Oslash": "Ø", "&Oslash;": "Ø", "&Otilde": "Õ", "&Otilde;": "Õ", "&Otimes;": "⨷", "&Ouml": "Ö", "&Ouml;": "Ö", "&OverBar;": "‾", "&OverBrace;": "⏞", "&OverBracket;": "⎴", "&OverParenthesis;": "⏜", "&PartialD;": "∂", "&Pcy;": "П", "&Pfr;": "𝔓", "&Phi;": "Φ", "&Pi;": "Π", "&PlusMinus;": "±", "&Poincareplane;": "ℌ", "&Popf;": "ℙ", "&Pr;": "⪻", "&Precedes;": "≺", "&PrecedesEqual;": "⪯", "&PrecedesSlantEqual;": "≼", "&PrecedesTilde;": "≾", "&Prime;": "″", "&Product;": "∏", "&Proportion;": "∷", "&Proportional;": "∝", "&Pscr;": "𝒫", "&Psi;": "Ψ", "&QUOT": '"', "&QUOT;": '"', "&Qfr;": "𝔔", "&Qopf;": "ℚ", "&Qscr;": "𝒬", "&RBarr;": "⤐", "&REG": "®", "&REG;": "®", "&Racute;": "Ŕ", "&Rang;": "⟫", "&Rarr;": "↠", "&Rarrtl;": "⤖", "&Rcaron;": "Ř", "&Rcedil;": "Ŗ", "&Rcy;": "Р", "&Re;": "ℜ", "&ReverseElement;": "∋", "&ReverseEquilibrium;": "⇋", "&ReverseUpEquilibrium;": "⥯", "&Rfr;": "ℜ", "&Rho;": "Ρ", "&RightAngleBracket;": "⟩", "&RightArrow;": "→", "&RightArrowBar;": "⇥", "&RightArrowLeftArrow;": "⇄", "&RightCeiling;": "⌉", "&RightDoubleBracket;": "⟧", "&RightDownTeeVector;": "⥝", "&RightDownVector;": "⇂", "&RightDownVectorBar;": "⥕", "&RightFloor;": "⌋", "&RightTee;": "⊢", "&RightTeeArrow;": "↦", "&RightTeeVector;": "⥛", "&RightTriangle;": "⊳", "&RightTriangleBar;": "⧐", "&RightTriangleEqual;": "⊵", "&RightUpDownVector;": "⥏", "&RightUpTeeVector;": "⥜", "&RightUpVector;": "↾", "&RightUpVectorBar;": "⥔", "&RightVector;": "⇀", "&RightVectorBar;": "⥓", "&Rightarrow;": "⇒", "&Ropf;": "ℝ", "&RoundImplies;": "⥰", "&Rrightarrow;": "⇛", "&Rscr;": "ℛ", "&Rsh;": "↱", "&RuleDelayed;": "⧴", "&SHCHcy;": "Щ", "&SHcy;": "Ш", "&SOFTcy;": "Ь", "&Sacute;": "Ś", "&Sc;": "⪼", "&Scaron;": "Š", "&Scedil;": "Ş", "&Scirc;": "Ŝ", "&Scy;": "С", "&Sfr;": "𝔖", "&ShortDownArrow;": "↓", "&ShortLeftArrow;": "←", "&ShortRightArrow;": "→", "&ShortUpArrow;": "↑", "&Sigma;": "Σ", "&SmallCircle;": "∘", "&Sopf;": "𝕊", "&Sqrt;": "√", "&Square;": "□", "&SquareIntersection;": "⊓", "&SquareSubset;": "⊏", "&SquareSubsetEqual;": "⊑", "&SquareSuperset;": "⊐", "&SquareSupersetEqual;": "⊒", "&SquareUnion;": "⊔", "&Sscr;": "𝒮", "&Star;": "⋆", "&Sub;": "⋐", "&Subset;": "⋐", "&SubsetEqual;": "⊆", "&Succeeds;": "≻", "&SucceedsEqual;": "⪰", "&SucceedsSlantEqual;": "≽", "&SucceedsTilde;": "≿", "&SuchThat;": "∋", "&Sum;": "∑", "&Sup;": "⋑", "&Superset;": "⊃", "&SupersetEqual;": "⊇", "&Supset;": "⋑", "&THORN": "Þ", "&THORN;": "Þ", "&TRADE;": "™", "&TSHcy;": "Ћ", "&TScy;": "Ц", "&Tab;": "\t", "&Tau;": "Τ", "&Tcaron;": "Ť", "&Tcedil;": "Ţ", "&Tcy;": "Т", "&Tfr;": "𝔗", "&Therefore;": "∴", "&Theta;": "Θ", "&ThickSpace;": "  ", "&ThinSpace;": " ", "&Tilde;": "∼", "&TildeEqual;": "≃", "&TildeFullEqual;": "≅", "&TildeTilde;": "≈", "&Topf;": "𝕋", "&TripleDot;": "⃛", "&Tscr;": "𝒯", "&Tstrok;": "Ŧ", "&Uacute": "Ú", "&Uacute;": "Ú", "&Uarr;": "↟", "&Uarrocir;": "⥉", "&Ubrcy;": "Ў", "&Ubreve;": "Ŭ", "&Ucirc": "Û", "&Ucirc;": "Û", "&Ucy;": "У", "&Udblac;": "Ű", "&Ufr;": "𝔘", "&Ugrave": "Ù", "&Ugrave;": "Ù", "&Umacr;": "Ū", "&UnderBar;": "_", "&UnderBrace;": "⏟", "&UnderBracket;": "⎵", "&UnderParenthesis;": "⏝", "&Union;": "⋃", "&UnionPlus;": "⊎", "&Uogon;": "Ų", "&Uopf;": "𝕌", "&UpArrow;": "↑", "&UpArrowBar;": "⤒", "&UpArrowDownArrow;": "⇅", "&UpDownArrow;": "↕", "&UpEquilibrium;": "⥮", "&UpTee;": "⊥", "&UpTeeArrow;": "↥", "&Uparrow;": "⇑", "&Updownarrow;": "⇕", "&UpperLeftArrow;": "↖", "&UpperRightArrow;": "↗", "&Upsi;": "ϒ", "&Upsilon;": "Υ", "&Uring;": "Ů", "&Uscr;": "𝒰", "&Utilde;": "Ũ", "&Uuml": "Ü", "&Uuml;": "Ü", "&VDash;": "⊫", "&Vbar;": "⫫", "&Vcy;": "В", "&Vdash;": "⊩", "&Vdashl;": "⫦", "&Vee;": "⋁", "&Verbar;": "‖", "&Vert;": "‖", "&VerticalBar;": "∣", "&VerticalLine;": "|", "&VerticalSeparator;": "❘", "&VerticalTilde;": "≀", "&VeryThinSpace;": " ", "&Vfr;": "𝔙", "&Vopf;": "𝕍", "&Vscr;": "𝒱", "&Vvdash;": "⊪", "&Wcirc;": "Ŵ", "&Wedge;": "⋀", "&Wfr;": "𝔚", "&Wopf;": "𝕎", "&Wscr;": "𝒲", "&Xfr;": "𝔛", "&Xi;": "Ξ", "&Xopf;": "𝕏", "&Xscr;": "𝒳", "&YAcy;": "Я", "&YIcy;": "Ї", "&YUcy;": "Ю", "&Yacute": "Ý", "&Yacute;": "Ý", "&Ycirc;": "Ŷ", "&Ycy;": "Ы", "&Yfr;": "𝔜", "&Yopf;": "𝕐", "&Yscr;": "𝒴", "&Yuml;": "Ÿ", "&ZHcy;": "Ж", "&Zacute;": "Ź", "&Zcaron;": "Ž", "&Zcy;": "З", "&Zdot;": "Ż", "&ZeroWidthSpace;": "​", "&Zeta;": "Ζ", "&Zfr;": "ℨ", "&Zopf;": "ℤ", "&Zscr;": "𝒵", "&aacute": "á", "&aacute;": "á", "&abreve;": "ă", "&ac;": "∾", "&acE;": "∾̳", "&acd;": "∿", "&acirc": "â", "&acirc;": "â", "&acute": "´", "&acute;": "´", "&acy;": "а", "&aelig": "æ", "&aelig;": "æ", "&af;": "⁡", "&afr;": "𝔞", "&agrave": "à", "&agrave;": "à", "&alefsym;": "ℵ", "&aleph;": "ℵ", "&alpha;": "α", "&amacr;": "ā", "&amalg;": "⨿", "&amp": "&", "&amp;": "&", "&and;": "∧", "&andand;": "⩕", "&andd;": "⩜", "&andslope;": "⩘", "&andv;": "⩚", "&ang;": "∠", "&ange;": "⦤", "&angle;": "∠", "&angmsd;": "∡", "&angmsdaa;": "⦨", "&angmsdab;": "⦩", "&angmsdac;": "⦪", "&angmsdad;": "⦫", "&angmsdae;": "⦬", "&angmsdaf;": "⦭", "&angmsdag;": "⦮", "&angmsdah;": "⦯", "&angrt;": "∟", "&angrtvb;": "⊾", "&angrtvbd;": "⦝", "&angsph;": "∢", "&angst;": "Å", "&angzarr;": "⍼", "&aogon;": "ą", "&aopf;": "𝕒", "&ap;": "≈", "&apE;": "⩰", "&apacir;": "⩯", "&ape;": "≊", "&apid;": "≋", "&apos;": "'", "&approx;": "≈", "&approxeq;": "≊", "&aring": "å", "&aring;": "å", "&ascr;": "𝒶", "&ast;": "*", "&asymp;": "≈", "&asympeq;": "≍", "&atilde": "ã", "&atilde;": "ã", "&auml": "ä", "&auml;": "ä", "&awconint;": "∳", "&awint;": "⨑", "&bNot;": "⫭", "&backcong;": "≌", "&backepsilon;": "϶", "&backprime;": "‵", "&backsim;": "∽", "&backsimeq;": "⋍", "&barvee;": "⊽", "&barwed;": "⌅", "&barwedge;": "⌅", "&bbrk;": "⎵", "&bbrktbrk;": "⎶", "&bcong;": "≌", "&bcy;": "б", "&bdquo;": "„", "&becaus;": "∵", "&because;": "∵", "&bemptyv;": "⦰", "&bepsi;": "϶", "&bernou;": "ℬ", "&beta;": "β", "&beth;": "ℶ", "&between;": "≬", "&bfr;": "𝔟", "&bigcap;": "⋂", "&bigcirc;": "◯", "&bigcup;": "⋃", "&bigodot;": "⨀", "&bigoplus;": "⨁", "&bigotimes;": "⨂", "&bigsqcup;": "⨆", "&bigstar;": "★", "&bigtriangledown;": "▽", "&bigtriangleup;": "△", "&biguplus;": "⨄", "&bigvee;": "⋁", "&bigwedge;": "⋀", "&bkarow;": "⤍", "&blacklozenge;": "⧫", "&blacksquare;": "▪", "&blacktriangle;": "▴", "&blacktriangledown;": "▾", "&blacktriangleleft;": "◂", "&blacktriangleright;": "▸", "&blank;": "␣", "&blk12;": "▒", "&blk14;": "░", "&blk34;": "▓", "&block;": "█", "&bne;": "=⃥", "&bnequiv;": "≡⃥", "&bnot;": "⌐", "&bopf;": "𝕓", "&bot;": "⊥", "&bottom;": "⊥", "&bowtie;": "⋈", "&boxDL;": "╗", "&boxDR;": "╔", "&boxDl;": "╖", "&boxDr;": "╓", "&boxH;": "═", "&boxHD;": "╦", "&boxHU;": "╩", "&boxHd;": "╤", "&boxHu;": "╧", "&boxUL;": "╝", "&boxUR;": "╚", "&boxUl;": "╜", "&boxUr;": "╙", "&boxV;": "║", "&boxVH;": "╬", "&boxVL;": "╣", "&boxVR;": "╠", "&boxVh;": "╫", "&boxVl;": "╢", "&boxVr;": "╟", "&boxbox;": "⧉", "&boxdL;": "╕", "&boxdR;": "╒", "&boxdl;": "┐", "&boxdr;": "┌", "&boxh;": "─", "&boxhD;": "╥", "&boxhU;": "╨", "&boxhd;": "┬", "&boxhu;": "┴", "&boxminus;": "⊟", "&boxplus;": "⊞", "&boxtimes;": "⊠", "&boxuL;": "╛", "&boxuR;": "╘", "&boxul;": "┘", "&boxur;": "└", "&boxv;": "│", "&boxvH;": "╪", "&boxvL;": "╡", "&boxvR;": "╞", "&boxvh;": "┼", "&boxvl;": "┤", "&boxvr;": "├", "&bprime;": "‵", "&breve;": "˘", "&brvbar": "¦", "&brvbar;": "¦", "&bscr;": "𝒷", "&bsemi;": "⁏", "&bsim;": "∽", "&bsime;": "⋍", "&bsol;": "\\", "&bsolb;": "⧅", "&bsolhsub;": "⟈", "&bull;": "•", "&bullet;": "•", "&bump;": "≎", "&bumpE;": "⪮", "&bumpe;": "≏", "&bumpeq;": "≏", "&cacute;": "ć", "&cap;": "∩", "&capand;": "⩄", "&capbrcup;": "⩉", "&capcap;": "⩋", "&capcup;": "⩇", "&capdot;": "⩀", "&caps;": "∩︀", "&caret;": "⁁", "&caron;": "ˇ", "&ccaps;": "⩍", "&ccaron;": "č", "&ccedil": "ç", "&ccedil;": "ç", "&ccirc;": "ĉ", "&ccups;": "⩌", "&ccupssm;": "⩐", "&cdot;": "ċ", "&cedil": "¸", "&cedil;": "¸", "&cemptyv;": "⦲", "&cent": "¢", "&cent;": "¢", "&centerdot;": "·", "&cfr;": "𝔠", "&chcy;": "ч", "&check;": "✓", "&checkmark;": "✓", "&chi;": "χ", "&cir;": "○", "&cirE;": "⧃", "&circ;": "ˆ", "&circeq;": "≗", "&circlearrowleft;": "↺", "&circlearrowright;": "↻", "&circledR;": "®", "&circledS;": "Ⓢ", "&circledast;": "⊛", "&circledcirc;": "⊚", "&circleddash;": "⊝", "&cire;": "≗", "&cirfnint;": "⨐", "&cirmid;": "⫯", "&cirscir;": "⧂", "&clubs;": "♣", "&clubsuit;": "♣", "&colon;": ":", "&colone;": "≔", "&coloneq;": "≔", "&comma;": ",", "&commat;": "@", "&comp;": "∁", "&compfn;": "∘", "&complement;": "∁", "&complexes;": "ℂ", "&cong;": "≅", "&congdot;": "⩭", "&conint;": "∮", "&copf;": "𝕔", "&coprod;": "∐", "&copy": "©", "&copy;": "©", "&copysr;": "℗", "&crarr;": "↵", "&cross;": "✗", "&cscr;": "𝒸", "&csub;": "⫏", "&csube;": "⫑", "&csup;": "⫐", "&csupe;": "⫒", "&ctdot;": "⋯", "&cudarrl;": "⤸", "&cudarrr;": "⤵", "&cuepr;": "⋞", "&cuesc;": "⋟", "&cularr;": "↶", "&cularrp;": "⤽", "&cup;": "∪", "&cupbrcap;": "⩈", "&cupcap;": "⩆", "&cupcup;": "⩊", "&cupdot;": "⊍", "&cupor;": "⩅", "&cups;": "∪︀", "&curarr;": "↷", "&curarrm;": "⤼", "&curlyeqprec;": "⋞", "&curlyeqsucc;": "⋟", "&curlyvee;": "⋎", "&curlywedge;": "⋏", "&curren": "¤", "&curren;": "¤", "&curvearrowleft;": "↶", "&curvearrowright;": "↷", "&cuvee;": "⋎", "&cuwed;": "⋏", "&cwconint;": "∲", "&cwint;": "∱", "&cylcty;": "⌭", "&dArr;": "⇓", "&dHar;": "⥥", "&dagger;": "†", "&daleth;": "ℸ", "&darr;": "↓", "&dash;": "‐", "&dashv;": "⊣", "&dbkarow;": "⤏", "&dblac;": "˝", "&dcaron;": "ď", "&dcy;": "д", "&dd;": "ⅆ", "&ddagger;": "‡", "&ddarr;": "⇊", "&ddotseq;": "⩷", "&deg": "°", "&deg;": "°", "&delta;": "δ", "&demptyv;": "⦱", "&dfisht;": "⥿", "&dfr;": "𝔡", "&dharl;": "⇃", "&dharr;": "⇂", "&diam;": "⋄", "&diamond;": "⋄", "&diamondsuit;": "♦", "&diams;": "♦", "&die;": "¨", "&digamma;": "ϝ", "&disin;": "⋲", "&div;": "÷", "&divide": "÷", "&divide;": "÷", "&divideontimes;": "⋇", "&divonx;": "⋇", "&djcy;": "ђ", "&dlcorn;": "⌞", "&dlcrop;": "⌍", "&dollar;": "$", "&dopf;": "𝕕", "&dot;": "˙", "&doteq;": "≐", "&doteqdot;": "≑", "&dotminus;": "∸", "&dotplus;": "∔", "&dotsquare;": "⊡", "&doublebarwedge;": "⌆", "&downarrow;": "↓", "&downdownarrows;": "⇊", "&downharpoonleft;": "⇃", "&downharpoonright;": "⇂", "&drbkarow;": "⤐", "&drcorn;": "⌟", "&drcrop;": "⌌", "&dscr;": "𝒹", "&dscy;": "ѕ", "&dsol;": "⧶", "&dstrok;": "đ", "&dtdot;": "⋱", "&dtri;": "▿", "&dtrif;": "▾", "&duarr;": "⇵", "&duhar;": "⥯", "&dwangle;": "⦦", "&dzcy;": "џ", "&dzigrarr;": "⟿", "&eDDot;": "⩷", "&eDot;": "≑", "&eacute": "é", "&eacute;": "é", "&easter;": "⩮", "&ecaron;": "ě", "&ecir;": "≖", "&ecirc": "ê", "&ecirc;": "ê", "&ecolon;": "≕", "&ecy;": "э", "&edot;": "ė", "&ee;": "ⅇ", "&efDot;": "≒", "&efr;": "𝔢", "&eg;": "⪚", "&egrave": "è", "&egrave;": "è", "&egs;": "⪖", "&egsdot;": "⪘", "&el;": "⪙", "&elinters;": "⏧", "&ell;": "ℓ", "&els;": "⪕", "&elsdot;": "⪗", "&emacr;": "ē", "&empty;": "∅", "&emptyset;": "∅", "&emptyv;": "∅", "&emsp13;": " ", "&emsp14;": " ", "&emsp;": " ", "&eng;": "ŋ", "&ensp;": " ", "&eogon;": "ę", "&eopf;": "𝕖", "&epar;": "⋕", "&eparsl;": "⧣", "&eplus;": "⩱", "&epsi;": "ε", "&epsilon;": "ε", "&epsiv;": "ϵ", "&eqcirc;": "≖", "&eqcolon;": "≕", "&eqsim;": "≂", "&eqslantgtr;": "⪖", "&eqslantless;": "⪕", "&equals;": "=", "&equest;": "≟", "&equiv;": "≡", "&equivDD;": "⩸", "&eqvparsl;": "⧥", "&erDot;": "≓", "&erarr;": "⥱", "&escr;": "ℯ", "&esdot;": "≐", "&esim;": "≂", "&eta;": "η", "&eth": "ð", "&eth;": "ð", "&euml": "ë", "&euml;": "ë", "&euro;": "€", "&excl;": "!", "&exist;": "∃", "&expectation;": "ℰ", "&exponentiale;": "ⅇ", "&fallingdotseq;": "≒", "&fcy;": "ф", "&female;": "♀", "&ffilig;": "ﬃ", "&fflig;": "ﬀ", "&ffllig;": "ﬄ", "&ffr;": "𝔣", "&filig;": "ﬁ", "&fjlig;": "fj", "&flat;": "♭", "&fllig;": "ﬂ", "&fltns;": "▱", "&fnof;": "ƒ", "&fopf;": "𝕗", "&forall;": "∀", "&fork;": "⋔", "&forkv;": "⫙", "&fpartint;": "⨍", "&frac12": "½", "&frac12;": "½", "&frac13;": "⅓", "&frac14": "¼", "&frac14;": "¼", "&frac15;": "⅕", "&frac16;": "⅙", "&frac18;": "⅛", "&frac23;": "⅔", "&frac25;": "⅖", "&frac34": "¾", "&frac34;": "¾", "&frac35;": "⅗", "&frac38;": "⅜", "&frac45;": "⅘", "&frac56;": "⅚", "&frac58;": "⅝", "&frac78;": "⅞", "&frasl;": "⁄", "&frown;": "⌢", "&fscr;": "𝒻", "&gE;": "≧", "&gEl;": "⪌", "&gacute;": "ǵ", "&gamma;": "γ", "&gammad;": "ϝ", "&gap;": "⪆", "&gbreve;": "ğ", "&gcirc;": "ĝ", "&gcy;": "г", "&gdot;": "ġ", "&ge;": "≥", "&gel;": "⋛", "&geq;": "≥", "&geqq;": "≧", "&geqslant;": "⩾", "&ges;": "⩾", "&gescc;": "⪩", "&gesdot;": "⪀", "&gesdoto;": "⪂", "&gesdotol;": "⪄", "&gesl;": "⋛︀", "&gesles;": "⪔", "&gfr;": "𝔤", "&gg;": "≫", "&ggg;": "⋙", "&gimel;": "ℷ", "&gjcy;": "ѓ", "&gl;": "≷", "&glE;": "⪒", "&gla;": "⪥", "&glj;": "⪤", "&gnE;": "≩", "&gnap;": "⪊", "&gnapprox;": "⪊", "&gne;": "⪈", "&gneq;": "⪈", "&gneqq;": "≩", "&gnsim;": "⋧", "&gopf;": "𝕘", "&grave;": "`", "&gscr;": "ℊ", "&gsim;": "≳", "&gsime;": "⪎", "&gsiml;": "⪐", "&gt": ">", "&gt;": ">", "&gtcc;": "⪧", "&gtcir;": "⩺", "&gtdot;": "⋗", "&gtlPar;": "⦕", "&gtquest;": "⩼", "&gtrapprox;": "⪆", "&gtrarr;": "⥸", "&gtrdot;": "⋗", "&gtreqless;": "⋛", "&gtreqqless;": "⪌", "&gtrless;": "≷", "&gtrsim;": "≳", "&gvertneqq;": "≩︀", "&gvnE;": "≩︀", "&hArr;": "⇔", "&hairsp;": " ", "&half;": "½", "&hamilt;": "ℋ", "&hardcy;": "ъ", "&harr;": "↔", "&harrcir;": "⥈", "&harrw;": "↭", "&hbar;": "ℏ", "&hcirc;": "ĥ", "&hearts;": "♥", "&heartsuit;": "♥", "&hellip;": "…", "&hercon;": "⊹", "&hfr;": "𝔥", "&hksearow;": "⤥", "&hkswarow;": "⤦", "&hoarr;": "⇿", "&homtht;": "∻", "&hookleftarrow;": "↩", "&hookrightarrow;": "↪", "&hopf;": "𝕙", "&horbar;": "―", "&hscr;": "𝒽", "&hslash;": "ℏ", "&hstrok;": "ħ", "&hybull;": "⁃", "&hyphen;": "‐", "&iacute": "í", "&iacute;": "í", "&ic;": "⁣", "&icirc": "î", "&icirc;": "î", "&icy;": "и", "&iecy;": "е", "&iexcl": "¡", "&iexcl;": "¡", "&iff;": "⇔", "&ifr;": "𝔦", "&igrave": "ì", "&igrave;": "ì", "&ii;": "ⅈ", "&iiiint;": "⨌", "&iiint;": "∭", "&iinfin;": "⧜", "&iiota;": "℩", "&ijlig;": "ĳ", "&imacr;": "ī", "&image;": "ℑ", "&imagline;": "ℐ", "&imagpart;": "ℑ", "&imath;": "ı", "&imof;": "⊷", "&imped;": "Ƶ", "&in;": "∈", "&incare;": "℅", "&infin;": "∞", "&infintie;": "⧝", "&inodot;": "ı", "&int;": "∫", "&intcal;": "⊺", "&integers;": "ℤ", "&intercal;": "⊺", "&intlarhk;": "⨗", "&intprod;": "⨼", "&iocy;": "ё", "&iogon;": "į", "&iopf;": "𝕚", "&iota;": "ι", "&iprod;": "⨼", "&iquest": "¿", "&iquest;": "¿", "&iscr;": "𝒾", "&isin;": "∈", "&isinE;": "⋹", "&isindot;": "⋵", "&isins;": "⋴", "&isinsv;": "⋳", "&isinv;": "∈", "&it;": "⁢", "&itilde;": "ĩ", "&iukcy;": "і", "&iuml": "ï", "&iuml;": "ï", "&jcirc;": "ĵ", "&jcy;": "й", "&jfr;": "𝔧", "&jmath;": "ȷ", "&jopf;": "𝕛", "&jscr;": "𝒿", "&jsercy;": "ј", "&jukcy;": "є", "&kappa;": "κ", "&kappav;": "ϰ", "&kcedil;": "ķ", "&kcy;": "к", "&kfr;": "𝔨", "&kgreen;": "ĸ", "&khcy;": "х", "&kjcy;": "ќ", "&kopf;": "𝕜", "&kscr;": "𝓀", "&lAarr;": "⇚", "&lArr;": "⇐", "&lAtail;": "⤛", "&lBarr;": "⤎", "&lE;": "≦", "&lEg;": "⪋", "&lHar;": "⥢", "&lacute;": "ĺ", "&laemptyv;": "⦴", "&lagran;": "ℒ", "&lambda;": "λ", "&lang;": "⟨", "&langd;": "⦑", "&langle;": "⟨", "&lap;": "⪅", "&laquo": "«", "&laquo;": "«", "&larr;": "←", "&larrb;": "⇤", "&larrbfs;": "⤟", "&larrfs;": "⤝", "&larrhk;": "↩", "&larrlp;": "↫", "&larrpl;": "⤹", "&larrsim;": "⥳", "&larrtl;": "↢", "&lat;": "⪫", "&latail;": "⤙", "&late;": "⪭", "&lates;": "⪭︀", "&lbarr;": "⤌", "&lbbrk;": "❲", "&lbrace;": "{", "&lbrack;": "[", "&lbrke;": "⦋", "&lbrksld;": "⦏", "&lbrkslu;": "⦍", "&lcaron;": "ľ", "&lcedil;": "ļ", "&lceil;": "⌈", "&lcub;": "{", "&lcy;": "л", "&ldca;": "⤶", "&ldquo;": "“", "&ldquor;": "„", "&ldrdhar;": "⥧", "&ldrushar;": "⥋", "&ldsh;": "↲", "&le;": "≤", "&leftarrow;": "←", "&leftarrowtail;": "↢", "&leftharpoondown;": "↽", "&leftharpoonup;": "↼", "&leftleftarrows;": "⇇", "&leftrightarrow;": "↔", "&leftrightarrows;": "⇆", "&leftrightharpoons;": "⇋", "&leftrightsquigarrow;": "↭", "&leftthreetimes;": "⋋", "&leg;": "⋚", "&leq;": "≤", "&leqq;": "≦", "&leqslant;": "⩽", "&les;": "⩽", "&lescc;": "⪨", "&lesdot;": "⩿", "&lesdoto;": "⪁", "&lesdotor;": "⪃", "&lesg;": "⋚︀", "&lesges;": "⪓", "&lessapprox;": "⪅", "&lessdot;": "⋖", "&lesseqgtr;": "⋚", "&lesseqqgtr;": "⪋", "&lessgtr;": "≶", "&lesssim;": "≲", "&lfisht;": "⥼", "&lfloor;": "⌊", "&lfr;": "𝔩", "&lg;": "≶", "&lgE;": "⪑", "&lhard;": "↽", "&lharu;": "↼", "&lharul;": "⥪", "&lhblk;": "▄", "&ljcy;": "љ", "&ll;": "≪", "&llarr;": "⇇", "&llcorner;": "⌞", "&llhard;": "⥫", "&lltri;": "◺", "&lmidot;": "ŀ", "&lmoust;": "⎰", "&lmoustache;": "⎰", "&lnE;": "≨", "&lnap;": "⪉", "&lnapprox;": "⪉", "&lne;": "⪇", "&lneq;": "⪇", "&lneqq;": "≨", "&lnsim;": "⋦", "&loang;": "⟬", "&loarr;": "⇽", "&lobrk;": "⟦", "&longleftarrow;": "⟵", "&longleftrightarrow;": "⟷", "&longmapsto;": "⟼", "&longrightarrow;": "⟶", "&looparrowleft;": "↫", "&looparrowright;": "↬", "&lopar;": "⦅", "&lopf;": "𝕝", "&loplus;": "⨭", "&lotimes;": "⨴", "&lowast;": "∗", "&lowbar;": "_", "&loz;": "◊", "&lozenge;": "◊", "&lozf;": "⧫", "&lpar;": "(", "&lparlt;": "⦓", "&lrarr;": "⇆", "&lrcorner;": "⌟", "&lrhar;": "⇋", "&lrhard;": "⥭", "&lrm;": "‎", "&lrtri;": "⊿", "&lsaquo;": "‹", "&lscr;": "𝓁", "&lsh;": "↰", "&lsim;": "≲", "&lsime;": "⪍", "&lsimg;": "⪏", "&lsqb;": "[", "&lsquo;": "‘", "&lsquor;": "‚", "&lstrok;": "ł", "&lt": "<", "&lt;": "<", "&ltcc;": "⪦", "&ltcir;": "⩹", "&ltdot;": "⋖", "&lthree;": "⋋", "&ltimes;": "⋉", "&ltlarr;": "⥶", "&ltquest;": "⩻", "&ltrPar;": "⦖", "&ltri;": "◃", "&ltrie;": "⊴", "&ltrif;": "◂", "&lurdshar;": "⥊", "&luruhar;": "⥦", "&lvertneqq;": "≨︀", "&lvnE;": "≨︀", "&mDDot;": "∺", "&macr": "¯", "&macr;": "¯", "&male;": "♂", "&malt;": "✠", "&maltese;": "✠", "&map;": "↦", "&mapsto;": "↦", "&mapstodown;": "↧", "&mapstoleft;": "↤", "&mapstoup;": "↥", "&marker;": "▮", "&mcomma;": "⨩", "&mcy;": "м", "&mdash;": "—", "&measuredangle;": "∡", "&mfr;": "𝔪", "&mho;": "℧", "&micro": "µ", "&micro;": "µ", "&mid;": "∣", "&midast;": "*", "&midcir;": "⫰", "&middot": "·", "&middot;": "·", "&minus;": "−", "&minusb;": "⊟", "&minusd;": "∸", "&minusdu;": "⨪", "&mlcp;": "⫛", "&mldr;": "…", "&mnplus;": "∓", "&models;": "⊧", "&mopf;": "𝕞", "&mp;": "∓", "&mscr;": "𝓂", "&mstpos;": "∾", "&mu;": "μ", "&multimap;": "⊸", "&mumap;": "⊸", "&nGg;": "⋙̸", "&nGt;": "≫⃒", "&nGtv;": "≫̸", "&nLeftarrow;": "⇍", "&nLeftrightarrow;": "⇎", "&nLl;": "⋘̸", "&nLt;": "≪⃒", "&nLtv;": "≪̸", "&nRightarrow;": "⇏", "&nVDash;": "⊯", "&nVdash;": "⊮", "&nabla;": "∇", "&nacute;": "ń", "&nang;": "∠⃒", "&nap;": "≉", "&napE;": "⩰̸", "&napid;": "≋̸", "&napos;": "ŉ", "&napprox;": "≉", "&natur;": "♮", "&natural;": "♮", "&naturals;": "ℕ", "&nbsp": " ", "&nbsp;": " ", "&nbump;": "≎̸", "&nbumpe;": "≏̸", "&ncap;": "⩃", "&ncaron;": "ň", "&ncedil;": "ņ", "&ncong;": "≇", "&ncongdot;": "⩭̸", "&ncup;": "⩂", "&ncy;": "н", "&ndash;": "–", "&ne;": "≠", "&neArr;": "⇗", "&nearhk;": "⤤", "&nearr;": "↗", "&nearrow;": "↗", "&nedot;": "≐̸", "&nequiv;": "≢", "&nesear;": "⤨", "&nesim;": "≂̸", "&nexist;": "∄", "&nexists;": "∄", "&nfr;": "𝔫", "&ngE;": "≧̸", "&nge;": "≱", "&ngeq;": "≱", "&ngeqq;": "≧̸", "&ngeqslant;": "⩾̸", "&nges;": "⩾̸", "&ngsim;": "≵", "&ngt;": "≯", "&ngtr;": "≯", "&nhArr;": "⇎", "&nharr;": "↮", "&nhpar;": "⫲", "&ni;": "∋", "&nis;": "⋼", "&nisd;": "⋺", "&niv;": "∋", "&njcy;": "њ", "&nlArr;": "⇍", "&nlE;": "≦̸", "&nlarr;": "↚", "&nldr;": "‥", "&nle;": "≰", "&nleftarrow;": "↚", "&nleftrightarrow;": "↮", "&nleq;": "≰", "&nleqq;": "≦̸", "&nleqslant;": "⩽̸", "&nles;": "⩽̸", "&nless;": "≮", "&nlsim;": "≴", "&nlt;": "≮", "&nltri;": "⋪", "&nltrie;": "⋬", "&nmid;": "∤", "&nopf;": "𝕟", "&not": "¬", "&not;": "¬", "&notin;": "∉", "&notinE;": "⋹̸", "&notindot;": "⋵̸", "&notinva;": "∉", "&notinvb;": "⋷", "&notinvc;": "⋶", "&notni;": "∌", "&notniva;": "∌", "&notnivb;": "⋾", "&notnivc;": "⋽", "&npar;": "∦", "&nparallel;": "∦", "&nparsl;": "⫽⃥", "&npart;": "∂̸", "&npolint;": "⨔", "&npr;": "⊀", "&nprcue;": "⋠", "&npre;": "⪯̸", "&nprec;": "⊀", "&npreceq;": "⪯̸", "&nrArr;": "⇏", "&nrarr;": "↛", "&nrarrc;": "⤳̸", "&nrarrw;": "↝̸", "&nrightarrow;": "↛", "&nrtri;": "⋫", "&nrtrie;": "⋭", "&nsc;": "⊁", "&nsccue;": "⋡", "&nsce;": "⪰̸", "&nscr;": "𝓃", "&nshortmid;": "∤", "&nshortparallel;": "∦", "&nsim;": "≁", "&nsime;": "≄", "&nsimeq;": "≄", "&nsmid;": "∤", "&nspar;": "∦", "&nsqsube;": "⋢", "&nsqsupe;": "⋣", "&nsub;": "⊄", "&nsubE;": "⫅̸", "&nsube;": "⊈", "&nsubset;": "⊂⃒", "&nsubseteq;": "⊈", "&nsubseteqq;": "⫅̸", "&nsucc;": "⊁", "&nsucceq;": "⪰̸", "&nsup;": "⊅", "&nsupE;": "⫆̸", "&nsupe;": "⊉", "&nsupset;": "⊃⃒", "&nsupseteq;": "⊉", "&nsupseteqq;": "⫆̸", "&ntgl;": "≹", "&ntilde": "ñ", "&ntilde;": "ñ", "&ntlg;": "≸", "&ntriangleleft;": "⋪", "&ntrianglelefteq;": "⋬", "&ntriangleright;": "⋫", "&ntrianglerighteq;": "⋭", "&nu;": "ν", "&num;": "#", "&numero;": "№", "&numsp;": " ", "&nvDash;": "⊭", "&nvHarr;": "⤄", "&nvap;": "≍⃒", "&nvdash;": "⊬", "&nvge;": "≥⃒", "&nvgt;": ">⃒", "&nvinfin;": "⧞", "&nvlArr;": "⤂", "&nvle;": "≤⃒", "&nvlt;": "<⃒", "&nvltrie;": "⊴⃒", "&nvrArr;": "⤃", "&nvrtrie;": "⊵⃒", "&nvsim;": "∼⃒", "&nwArr;": "⇖", "&nwarhk;": "⤣", "&nwarr;": "↖", "&nwarrow;": "↖", "&nwnear;": "⤧", "&oS;": "Ⓢ", "&oacute": "ó", "&oacute;": "ó", "&oast;": "⊛", "&ocir;": "⊚", "&ocirc": "ô", "&ocirc;": "ô", "&ocy;": "о", "&odash;": "⊝", "&odblac;": "ő", "&odiv;": "⨸", "&odot;": "⊙", "&odsold;": "⦼", "&oelig;": "œ", "&ofcir;": "⦿", "&ofr;": "𝔬", "&ogon;": "˛", "&ograve": "ò", "&ograve;": "ò", "&ogt;": "⧁", "&ohbar;": "⦵", "&ohm;": "Ω", "&oint;": "∮", "&olarr;": "↺", "&olcir;": "⦾", "&olcross;": "⦻", "&oline;": "‾", "&olt;": "⧀", "&omacr;": "ō", "&omega;": "ω", "&omicron;": "ο", "&omid;": "⦶", "&ominus;": "⊖", "&oopf;": "𝕠", "&opar;": "⦷", "&operp;": "⦹", "&oplus;": "⊕", "&or;": "∨", "&orarr;": "↻", "&ord;": "⩝", "&order;": "ℴ", "&orderof;": "ℴ", "&ordf": "ª", "&ordf;": "ª", "&ordm": "º", "&ordm;": "º", "&origof;": "⊶", "&oror;": "⩖", "&orslope;": "⩗", "&orv;": "⩛", "&oscr;": "ℴ", "&oslash": "ø", "&oslash;": "ø", "&osol;": "⊘", "&otilde": "õ", "&otilde;": "õ", "&otimes;": "⊗", "&otimesas;": "⨶", "&ouml": "ö", "&ouml;": "ö", "&ovbar;": "⌽", "&par;": "∥", "&para": "¶", "&para;": "¶", "&parallel;": "∥", "&parsim;": "⫳", "&parsl;": "⫽", "&part;": "∂", "&pcy;": "п", "&percnt;": "%", "&period;": ".", "&permil;": "‰", "&perp;": "⊥", "&pertenk;": "‱", "&pfr;": "𝔭", "&phi;": "φ", "&phiv;": "ϕ", "&phmmat;": "ℳ", "&phone;": "☎", "&pi;": "π", "&pitchfork;": "⋔", "&piv;": "ϖ", "&planck;": "ℏ", "&planckh;": "ℎ", "&plankv;": "ℏ", "&plus;": "+", "&plusacir;": "⨣", "&plusb;": "⊞", "&pluscir;": "⨢", "&plusdo;": "∔", "&plusdu;": "⨥", "&pluse;": "⩲", "&plusmn": "±", "&plusmn;": "±", "&plussim;": "⨦", "&plustwo;": "⨧", "&pm;": "±", "&pointint;": "⨕", "&popf;": "𝕡", "&pound": "£", "&pound;": "£", "&pr;": "≺", "&prE;": "⪳", "&prap;": "⪷", "&prcue;": "≼", "&pre;": "⪯", "&prec;": "≺", "&precapprox;": "⪷", "&preccurlyeq;": "≼", "&preceq;": "⪯", "&precnapprox;": "⪹", "&precneqq;": "⪵", "&precnsim;": "⋨", "&precsim;": "≾", "&prime;": "′", "&primes;": "ℙ", "&prnE;": "⪵", "&prnap;": "⪹", "&prnsim;": "⋨", "&prod;": "∏", "&profalar;": "⌮", "&profline;": "⌒", "&profsurf;": "⌓", "&prop;": "∝", "&propto;": "∝", "&prsim;": "≾", "&prurel;": "⊰", "&pscr;": "𝓅", "&psi;": "ψ", "&puncsp;": " ", "&qfr;": "𝔮", "&qint;": "⨌", "&qopf;": "𝕢", "&qprime;": "⁗", "&qscr;": "𝓆", "&quaternions;": "ℍ", "&quatint;": "⨖", "&quest;": "?", "&questeq;": "≟", "&quot": '"', "&quot;": '"', "&rAarr;": "⇛", "&rArr;": "⇒", "&rAtail;": "⤜", "&rBarr;": "⤏", "&rHar;": "⥤", "&race;": "∽̱", "&racute;": "ŕ", "&radic;": "√", "&raemptyv;": "⦳", "&rang;": "⟩", "&rangd;": "⦒", "&range;": "⦥", "&rangle;": "⟩", "&raquo": "»", "&raquo;": "»", "&rarr;": "→", "&rarrap;": "⥵", "&rarrb;": "⇥", "&rarrbfs;": "⤠", "&rarrc;": "⤳", "&rarrfs;": "⤞", "&rarrhk;": "↪", "&rarrlp;": "↬", "&rarrpl;": "⥅", "&rarrsim;": "⥴", "&rarrtl;": "↣", "&rarrw;": "↝", "&ratail;": "⤚", "&ratio;": "∶", "&rationals;": "ℚ", "&rbarr;": "⤍", "&rbbrk;": "❳", "&rbrace;": "}", "&rbrack;": "]", "&rbrke;": "⦌", "&rbrksld;": "⦎", "&rbrkslu;": "⦐", "&rcaron;": "ř", "&rcedil;": "ŗ", "&rceil;": "⌉", "&rcub;": "}", "&rcy;": "р", "&rdca;": "⤷", "&rdldhar;": "⥩", "&rdquo;": "”", "&rdquor;": "”", "&rdsh;": "↳", "&real;": "ℜ", "&realine;": "ℛ", "&realpart;": "ℜ", "&reals;": "ℝ", "&rect;": "▭", "&reg": "®", "&reg;": "®", "&rfisht;": "⥽", "&rfloor;": "⌋", "&rfr;": "𝔯", "&rhard;": "⇁", "&rharu;": "⇀", "&rharul;": "⥬", "&rho;": "ρ", "&rhov;": "ϱ", "&rightarrow;": "→", "&rightarrowtail;": "↣", "&rightharpoondown;": "⇁", "&rightharpoonup;": "⇀", "&rightleftarrows;": "⇄", "&rightleftharpoons;": "⇌", "&rightrightarrows;": "⇉", "&rightsquigarrow;": "↝", "&rightthreetimes;": "⋌", "&ring;": "˚", "&risingdotseq;": "≓", "&rlarr;": "⇄", "&rlhar;": "⇌", "&rlm;": "‏", "&rmoust;": "⎱", "&rmoustache;": "⎱", "&rnmid;": "⫮", "&roang;": "⟭", "&roarr;": "⇾", "&robrk;": "⟧", "&ropar;": "⦆", "&ropf;": "𝕣", "&roplus;": "⨮", "&rotimes;": "⨵", "&rpar;": ")", "&rpargt;": "⦔", "&rppolint;": "⨒", "&rrarr;": "⇉", "&rsaquo;": "›", "&rscr;": "𝓇", "&rsh;": "↱", "&rsqb;": "]", "&rsquo;": "’", "&rsquor;": "’", "&rthree;": "⋌", "&rtimes;": "⋊", "&rtri;": "▹", "&rtrie;": "⊵", "&rtrif;": "▸", "&rtriltri;": "⧎", "&ruluhar;": "⥨", "&rx;": "℞", "&sacute;": "ś", "&sbquo;": "‚", "&sc;": "≻", "&scE;": "⪴", "&scap;": "⪸", "&scaron;": "š", "&sccue;": "≽", "&sce;": "⪰", "&scedil;": "ş", "&scirc;": "ŝ", "&scnE;": "⪶", "&scnap;": "⪺", "&scnsim;": "⋩", "&scpolint;": "⨓", "&scsim;": "≿", "&scy;": "с", "&sdot;": "⋅", "&sdotb;": "⊡", "&sdote;": "⩦", "&seArr;": "⇘", "&searhk;": "⤥", "&searr;": "↘", "&searrow;": "↘", "&sect": "§", "&sect;": "§", "&semi;": ";", "&seswar;": "⤩", "&setminus;": "∖", "&setmn;": "∖", "&sext;": "✶", "&sfr;": "𝔰", "&sfrown;": "⌢", "&sharp;": "♯", "&shchcy;": "щ", "&shcy;": "ш", "&shortmid;": "∣", "&shortparallel;": "∥", "&shy": "­", "&shy;": "­", "&sigma;": "σ", "&sigmaf;": "ς", "&sigmav;": "ς", "&sim;": "∼", "&simdot;": "⩪", "&sime;": "≃", "&simeq;": "≃", "&simg;": "⪞", "&simgE;": "⪠", "&siml;": "⪝", "&simlE;": "⪟", "&simne;": "≆", "&simplus;": "⨤", "&simrarr;": "⥲", "&slarr;": "←", "&smallsetminus;": "∖", "&smashp;": "⨳", "&smeparsl;": "⧤", "&smid;": "∣", "&smile;": "⌣", "&smt;": "⪪", "&smte;": "⪬", "&smtes;": "⪬︀", "&softcy;": "ь", "&sol;": "/", "&solb;": "⧄", "&solbar;": "⌿", "&sopf;": "𝕤", "&spades;": "♠", "&spadesuit;": "♠", "&spar;": "∥", "&sqcap;": "⊓", "&sqcaps;": "⊓︀", "&sqcup;": "⊔", "&sqcups;": "⊔︀", "&sqsub;": "⊏", "&sqsube;": "⊑", "&sqsubset;": "⊏", "&sqsubseteq;": "⊑", "&sqsup;": "⊐", "&sqsupe;": "⊒", "&sqsupset;": "⊐", "&sqsupseteq;": "⊒", "&squ;": "□", "&square;": "□", "&squarf;": "▪", "&squf;": "▪", "&srarr;": "→", "&sscr;": "𝓈", "&ssetmn;": "∖", "&ssmile;": "⌣", "&sstarf;": "⋆", "&star;": "☆", "&starf;": "★", "&straightepsilon;": "ϵ", "&straightphi;": "ϕ", "&strns;": "¯", "&sub;": "⊂", "&subE;": "⫅", "&subdot;": "⪽", "&sube;": "⊆", "&subedot;": "⫃", "&submult;": "⫁", "&subnE;": "⫋", "&subne;": "⊊", "&subplus;": "⪿", "&subrarr;": "⥹", "&subset;": "⊂", "&subseteq;": "⊆", "&subseteqq;": "⫅", "&subsetneq;": "⊊", "&subsetneqq;": "⫋", "&subsim;": "⫇", "&subsub;": "⫕", "&subsup;": "⫓", "&succ;": "≻", "&succapprox;": "⪸", "&succcurlyeq;": "≽", "&succeq;": "⪰", "&succnapprox;": "⪺", "&succneqq;": "⪶", "&succnsim;": "⋩", "&succsim;": "≿", "&sum;": "∑", "&sung;": "♪", "&sup1": "¹", "&sup1;": "¹", "&sup2": "²", "&sup2;": "²", "&sup3": "³", "&sup3;": "³", "&sup;": "⊃", "&supE;": "⫆", "&supdot;": "⪾", "&supdsub;": "⫘", "&supe;": "⊇", "&supedot;": "⫄", "&suphsol;": "⟉", "&suphsub;": "⫗", "&suplarr;": "⥻", "&supmult;": "⫂", "&supnE;": "⫌", "&supne;": "⊋", "&supplus;": "⫀", "&supset;": "⊃", "&supseteq;": "⊇", "&supseteqq;": "⫆", "&supsetneq;": "⊋", "&supsetneqq;": "⫌", "&supsim;": "⫈", "&supsub;": "⫔", "&supsup;": "⫖", "&swArr;": "⇙", "&swarhk;": "⤦", "&swarr;": "↙", "&swarrow;": "↙", "&swnwar;": "⤪", "&szlig": "ß", "&szlig;": "ß", "&target;": "⌖", "&tau;": "τ", "&tbrk;": "⎴", "&tcaron;": "ť", "&tcedil;": "ţ", "&tcy;": "т", "&tdot;": "⃛", "&telrec;": "⌕", "&tfr;": "𝔱", "&there4;": "∴", "&therefore;": "∴", "&theta;": "θ", "&thetasym;": "ϑ", "&thetav;": "ϑ", "&thickapprox;": "≈", "&thicksim;": "∼", "&thinsp;": " ", "&thkap;": "≈", "&thksim;": "∼", "&thorn": "þ", "&thorn;": "þ", "&tilde;": "˜", "&times": "×", "&times;": "×", "&timesb;": "⊠", "&timesbar;": "⨱", "&timesd;": "⨰", "&tint;": "∭", "&toea;": "⤨", "&top;": "⊤", "&topbot;": "⌶", "&topcir;": "⫱", "&topf;": "𝕥", "&topfork;": "⫚", "&tosa;": "⤩", "&tprime;": "‴", "&trade;": "™", "&triangle;": "▵", "&triangledown;": "▿", "&triangleleft;": "◃", "&trianglelefteq;": "⊴", "&triangleq;": "≜", "&triangleright;": "▹", "&trianglerighteq;": "⊵", "&tridot;": "◬", "&trie;": "≜", "&triminus;": "⨺", "&triplus;": "⨹", "&trisb;": "⧍", "&tritime;": "⨻", "&trpezium;": "⏢", "&tscr;": "𝓉", "&tscy;": "ц", "&tshcy;": "ћ", "&tstrok;": "ŧ", "&twixt;": "≬", "&twoheadleftarrow;": "↞", "&twoheadrightarrow;": "↠", "&uArr;": "⇑", "&uHar;": "⥣", "&uacute": "ú", "&uacute;": "ú", "&uarr;": "↑", "&ubrcy;": "ў", "&ubreve;": "ŭ", "&ucirc": "û", "&ucirc;": "û", "&ucy;": "у", "&udarr;": "⇅", "&udblac;": "ű", "&udhar;": "⥮", "&ufisht;": "⥾", "&ufr;": "𝔲", "&ugrave": "ù", "&ugrave;": "ù", "&uharl;": "↿", "&uharr;": "↾", "&uhblk;": "▀", "&ulcorn;": "⌜", "&ulcorner;": "⌜", "&ulcrop;": "⌏", "&ultri;": "◸", "&umacr;": "ū", "&uml": "¨", "&uml;": "¨", "&uogon;": "ų", "&uopf;": "𝕦", "&uparrow;": "↑", "&updownarrow;": "↕", "&upharpoonleft;": "↿", "&upharpoonright;": "↾", "&uplus;": "⊎", "&upsi;": "υ", "&upsih;": "ϒ", "&upsilon;": "υ", "&upuparrows;": "⇈", "&urcorn;": "⌝", "&urcorner;": "⌝", "&urcrop;": "⌎", "&uring;": "ů", "&urtri;": "◹", "&uscr;": "𝓊", "&utdot;": "⋰", "&utilde;": "ũ", "&utri;": "▵", "&utrif;": "▴", "&uuarr;": "⇈", "&uuml": "ü", "&uuml;": "ü", "&uwangle;": "⦧", "&vArr;": "⇕", "&vBar;": "⫨", "&vBarv;": "⫩", "&vDash;": "⊨", "&vangrt;": "⦜", "&varepsilon;": "ϵ", "&varkappa;": "ϰ", "&varnothing;": "∅", "&varphi;": "ϕ", "&varpi;": "ϖ", "&varpropto;": "∝", "&varr;": "↕", "&varrho;": "ϱ", "&varsigma;": "ς", "&varsubsetneq;": "⊊︀", "&varsubsetneqq;": "⫋︀", "&varsupsetneq;": "⊋︀", "&varsupsetneqq;": "⫌︀", "&vartheta;": "ϑ", "&vartriangleleft;": "⊲", "&vartriangleright;": "⊳", "&vcy;": "в", "&vdash;": "⊢", "&vee;": "∨", "&veebar;": "⊻", "&veeeq;": "≚", "&vellip;": "⋮", "&verbar;": "|", "&vert;": "|", "&vfr;": "𝔳", "&vltri;": "⊲", "&vnsub;": "⊂⃒", "&vnsup;": "⊃⃒", "&vopf;": "𝕧", "&vprop;": "∝", "&vrtri;": "⊳", "&vscr;": "𝓋", "&vsubnE;": "⫋︀", "&vsubne;": "⊊︀", "&vsupnE;": "⫌︀", "&vsupne;": "⊋︀", "&vzigzag;": "⦚", "&wcirc;": "ŵ", "&wedbar;": "⩟", "&wedge;": "∧", "&wedgeq;": "≙", "&weierp;": "℘", "&wfr;": "𝔴", "&wopf;": "𝕨", "&wp;": "℘", "&wr;": "≀", "&wreath;": "≀", "&wscr;": "𝓌", "&xcap;": "⋂", "&xcirc;": "◯", "&xcup;": "⋃", "&xdtri;": "▽", "&xfr;": "𝔵", "&xhArr;": "⟺", "&xharr;": "⟷", "&xi;": "ξ", "&xlArr;": "⟸", "&xlarr;": "⟵", "&xmap;": "⟼", "&xnis;": "⋻", "&xodot;": "⨀", "&xopf;": "𝕩", "&xoplus;": "⨁", "&xotime;": "⨂", "&xrArr;": "⟹", "&xrarr;": "⟶", "&xscr;": "𝓍", "&xsqcup;": "⨆", "&xuplus;": "⨄", "&xutri;": "△", "&xvee;": "⋁", "&xwedge;": "⋀", "&yacute": "ý", "&yacute;": "ý", "&yacy;": "я", "&ycirc;": "ŷ", "&ycy;": "ы", "&yen": "¥", "&yen;": "¥", "&yfr;": "𝔶", "&yicy;": "ї", "&yopf;": "𝕪", "&yscr;": "𝓎", "&yucy;": "ю", "&yuml": "ÿ", "&yuml;": "ÿ", "&zacute;": "ź", "&zcaron;": "ž", "&zcy;": "з", "&zdot;": "ż", "&zeetrf;": "ℨ", "&zeta;": "ζ", "&zfr;": "𝔷", "&zhcy;": "ж", "&zigrarr;": "⇝", "&zopf;": "𝕫", "&zscr;": "𝓏", "&zwj;": "‍", "&zwnj;": "‌" };
const numericUnicodeMap = {
	0: 65533,
	128: 8364,
	130: 8218,
	131: 402,
	132: 8222,
	133: 8230,
	134: 8224,
	135: 8225,
	136: 710,
	137: 8240,
	138: 352,
	139: 8249,
	140: 338,
	142: 381,
	145: 8216,
	146: 8217,
	147: 8220,
	148: 8221,
	149: 8226,
	150: 8211,
	151: 8212,
	152: 732,
	153: 8482,
	154: 353,
	155: 8250,
	156: 339,
	158: 382,
	159: 376
};
const fromCodePoint = String.fromCodePoint || function (astralCodePoint) {
	return String.fromCharCode(
		Math.floor((astralCodePoint - 0x10000) / 0x400) + 0xd800,
		((astralCodePoint - 0x10000) % 0x400) + 0xdc00
	);
};
const fromCharCode = String.fromCharCode;
const replaceUsingRegExp = (macroText, macroRegExp, macroReplacer) => {
	macroRegExp.lastIndex = 0;
	let replaceMatch = macroRegExp.exec(macroText);
	let replaceResult;
	if (replaceMatch) {
		replaceResult = '';
		let replaceLastIndex = 0;
		do {
			if (replaceLastIndex !== replaceMatch.index) {
				replaceResult += macroText.substring(replaceLastIndex, replaceMatch.index);
			}
			const replaceInput = replaceMatch[0];
			replaceResult += macroReplacer(replaceInput);
			replaceLastIndex = replaceMatch.index + replaceInput.length;
		} while ((replaceMatch = macroRegExp.exec(macroText)));

		if (replaceLastIndex !== macroText.length) {
			replaceResult += macroText.substring(replaceLastIndex);
		}
	} else {
		replaceResult = macroText;
	}
	return replaceResult;
}
const getDecodedEntity = (entity, references, isAttribute, isStrict) => {
	let decodeResult = entity;
	const decodeEntityLastChar = entity[entity.length - 1];
	if (isAttribute && decodeEntityLastChar === '=') {
		decodeResult = entity;
	} else if (isStrict && decodeEntityLastChar !== ';') {
		decodeResult = entity;
	} else {
		const decodeResultByReference = references[entity];
		if (decodeResultByReference) {
			decodeResult = decodeResultByReference;
		} else if (entity[0] === '&' && entity[1] === '#') {
			const decodeSecondChar = entity[2];
			const decodeCode =
				decodeSecondChar == 'x' || decodeSecondChar == 'X'
					? parseInt(entity.substr(3), 16)
					: parseInt(entity.substr(2));

			decodeResult =
				decodeCode >= 0x10ffff
					? outOfBoundsChar
					: decodeCode > 65535
						? fromCodePoint(decodeCode)
						: fromCharCode(numericUnicodeMap[decodeCode] || decodeCode);
		}
	}
	return decodeResult;
}

function decode(text, options = { level: 'all', scope: 'body' }) {
	if (!text) {
		return '';
	}

	const decodeRegExp = /&(?:AElig|AMP|Aacute|Acirc|Agrave|Aring|Atilde|Auml|COPY|Ccedil|ETH|Eacute|Ecirc|Egrave|Euml|GT|Iacute|Icirc|Igrave|Iuml|LT|Ntilde|Oacute|Ocirc|Ograve|Oslash|Otilde|Ouml|QUOT|REG|THORN|Uacute|Ucirc|Ugrave|Uuml|Yacute|aacute|acirc|acute|aelig|agrave|amp|aring|atilde|auml|brvbar|ccedil|cedil|cent|copy|curren|deg|divide|eacute|ecirc|egrave|eth|euml|frac12|frac14|frac34|gt|iacute|icirc|iexcl|igrave|iquest|iuml|laquo|lt|macr|micro|middot|nbsp|not|ntilde|oacute|ocirc|ograve|ordf|ordm|oslash|otilde|ouml|para|plusmn|pound|quot|raquo|reg|sect|shy|sup1|sup2|sup3|szlig|thorn|times|uacute|ucirc|ugrave|uml|uuml|yacute|yen|yuml|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g
	const references = entities;
	const isAttribute = options.scope === 'attribute';
	const isStrict = options.scope === 'strict';

	return replaceUsingRegExp(text, decodeRegExp, (entity) =>
		getDecodedEntity(entity, references, isAttribute, isStrict)
	);
}