const express = require('express')
const router = express.Router()
const geolib = require('geolib')
const Tree = require('../models/Tree')
const User = require('../models/User')
const Instrument = require('../models/Instrument')
const Genre = require('../models/Genre')

var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyAjWQy9cOp3FQf72TDa6B7mFofMeK9yXBg',
  formatter: null
};
var geocoder = NodeGeocoder(options);

//data will be track object
function NodeClass(data) {
    this.data = data
    this.children = []
}

function TreeClass(data) {
    var node = new NodeClass(data)
    this._root = node
}

//search for a track node
TreeClass.prototype.search = function(curNode, dataParam, key) {
	if (curNode.data[dataParam] == key) {
		return curNode
	}
	else if (curNode.children == []) {
		return null
	}
	else {
		var res = null
		for (var i = 0; i < curNode.children.length; i++) {
			res = TreeClass.prototype.search(curNode.children[i], dataParam, key)
			if (res != null) {
				return res
			}
		}
	}
	return null
}

//add a track node to a specified node
TreeClass.prototype.add = function(curNode, newData) {
	var newNode = new NodeClass(newData)
	curNode.children.push(newNode)
}

//remove a track node from a tree, assumes root is not the node being removed
TreeClass.prototype.remove = function(curNode, dataParam, key) {
	var nodeList = curNode.children
	for (var i = 0; i < nodeList.length; i++) {
		if (nodeList[i].data[dataParam] == key) {
			nodeList.splice(i, 1)
			return 1
		}
	}
	for (var i = 0; i < nodeList.length; i++) {
		if (TreeClass.prototype.remove(nodeList[i], dataParam, key) == 1) {
			return 1
		}
	}
	return 0
}

//get the number of children of a specified node(number of tracks created from that track)
TreeClass.prototype.getNumChildren = function(curNode) {
	if (curNode.children == []) {
		return 0
	}
	else {
		var res = 0
		for (var i = 0; i < curNode.children.length; i++) {
			res += getNumChildren(curNode.children[i])
		}
		return curNode.children.length + res
	}
}

//get every tree from the db
router.get('/trees', function(req, res, next) {
	Tree.find({}).then(function(allTrees) {
		res.send(allTrees)
	}).catch(next)
})

//get searched trees from the db with simple search
router.get('/trees/simplesearch/:input', function(req, res, next) {
	var input = req.params.input.toLowerCase()
	Tree.find({treeName: input}).then(function(tree) {
		if (tree.toString() != "") {
			res.send(tree)
			return
		}
		else {
			Tree.find({}).then(function(trees) {
				var matchedTrees = []
				for (var i = 0; i < trees.length; i++) {
					if (trees[i].collaboratorNames.map(s => s.toLowerCase()).includes(input) || 
						trees[i].instruments.map(s => s.toLowerCase()).includes(input) || 
						trees[i].genres.map(s => s.toLowerCase()).includes(input)) {
						matchedTrees.push(trees[i])
					}
				}
				res.send(matchedTrees)
			}).catch(next)
		}
	}).catch(next)
})

//get searched trees from the db with advanced search
router.post('/trees/advancedsearch', function(req, res, next) {
	//shorten variable names
	var collaboratorNamesInput = req.body.collaboratorNamesInput
	var instrumentsInput = req.body.instrumentsInput
	var genresInput = req.body.genresInput
	var numTracksInputLower = req.body.numTracksInputLower
	var numTracksInputUpper = req.body.numTracksInputUpper
	var bpmInputLower = req.body.bpmInputLower
	var bpmInputUpper = req.body.bpmInputUpper
	var numUpVotesInput = req.body.numUpVotesInput
	//parse input string for collaborator names
	if (collaboratorNamesInput != ""){
		var collaboratorNames = []
		var numCommas = collaboratorNamesInput.split(",").length - 1
		for (var i = 0; i < numCommas; i++) {
			collaboratorNames.push(collaboratorNamesInput.slice(0, collaboratorNamesInput.indexOf(",")))
			collaboratorNamesInput = collaboratorNamesInput.slice(collaboratorNamesInput.indexOf(",") + 1, collaboratorNamesInput.length)
		}
		collaboratorNames.push(collaboratorNamesInput)
		var collaboratorNamesSet = new Set()
	}
	var treeIncludes
	var matchedTrees = []
	//iterate thru each tree and check if it's a match
	Tree.find({}).then(function(trees) {
		for (var i = 0; i < trees.length; i++) {
			if (collaboratorNamesInput != "") {
				collaboratorNamesSet = new Set(trees[i].collaboratorNames.map(s => s.toLowerCase()))
				treeIncludes = true
				for (var j = 0; j < collaboratorNames.length; j++) {
					if (!collaboratorNamesSet.has(collaboratorNames[j])) {
						treeIncludes = false
						break
					}
				}
				if (!treeIncludes) {continue}
			}
			if (instrumentsInput != []) {
				instrumentsSet = new Set(trees[i].instruments.map(s => s.toLowerCase()))
				treeIncludes = true
				for (j = 0; j < instrumentsInput.length; j++) {
					if (!instrumentsSet.has(instrumentsInput[j])) {
						treeIncludes = false
						break
					}
				}
				if (!treeIncludes) {continue}
			}
			if (genresInput != []) {
				genresSet = new Set(trees[i].genres.map(s => s.toLowerCase()))
				treeIncludes = true
				for (j = 0; j < genresInput.length; j++) {
					if (!genresSet.has(genresInput[j])) {
						treeIncludes = false
						break
					}
				}
				if (!treeIncludes) {continue}
			}
			if (numTracksInputLower != "") {
				if (numTracksInputUpper != "" && 
					!(trees[i].numTracks >= numTracksInputLower && trees[i].numTracks <= numTracksInputUpper)) {
					continue
				}
				else if (numTracksInputUpper == "" && trees[i].numTracks < numTracksInputLower) {
					continue
				}
			}
			else if (numTracksInputUpper != "" && trees[i].numTracks > numTracksInputUpper) {
				continue
			}
			if (bpmInputLower != "") {
				if (bpmInputUpper != "" && 
					!(trees[i].bpm >= bpmInputLower && trees[i].bpm <= bpmInputUpper)) {
					continue
				}
				else if (bpmInputUpper == "" && trees[i].bpm < bpmInputLower) {
					continue
				}
			}
			else if (bpmInputUpper != "" && trees[i].bpm > bpmInputUpper) {
				continue
			}
			if (numUpVotesInput != "" && trees[i].totalUpVotes < numUpVotesInput) {
				continue
			}
			matchedTrees.push(trees[i])
		}
		res.send(matchedTrees)
	}).catch(next)
})

//get every user from the db
router.get('/users', function(req, res, next) {
	User.find({}).then(function(allUsers) {
		res.send(allUsers)
	}).catch(next)
})

//get every instrument from the db
router.get('/instruments', function(req, res, next) {
	Instrument.find({}).then(function(allInstruments) {
		res.send(allInstruments)
	}).catch(next)
})

//get every genre from the db
router.get('/genres', function(req, res, next) {
	Genre.find({}).then(function(allGenres) {
		res.send(allGenres)
	}).catch(next)
})

//get searched uers from the db with advanced search
router.post('/users/advancedsearch', function(req, res, next) {
	//shorten variable names
	var usernameInput = req.body.usernameInput
	var instrumentsInput = req.body.instrumentsInput
	var genresInput = req.body.genresInput
	var milesInput = req.body.milesInput
	var numUpVotesInput = req.body.numUpVotesInput
	var matchedUsers = []
	//iterate thru each user and check if they're a match
	User.find({}).then(function(users) {
		for (var i = 0; i < users.length; i++) {
			if (usernameInput != "" && users[i].username.toLowerCase() != usernameInput) {
				continue
			}
			if (instrumentsInput != []) {
				instrumentsSet = new Set(users[i].instruments.map(s => s.toLowerCase()))
				treeIncludes = true
				for (j = 0; j < instrumentsInput.length; j++) {
					if (!instrumentsSet.has(instrumentsInput[j])) {
						treeIncludes = false
						break
					}
				}
				if (!treeIncludes) {continue}
			}
			if (genresInput != []) {
				genresSet = new Set(users[i].genres.map(s => s.toLowerCase()))
				treeIncludes = true
				for (j = 0; j < genresInput.length; j++) {
					if (!genresSet.has(genresInput[j])) {
						treeIncludes = false
						break
					}
				}
				if (!treeIncludes) {continue}
			}
			if (milesInput != "" && geolib.getDistance({latitude: 50, longitude: 7}, {latitude: users[i].locationCoord[0], longitude: users[i].locationCoord[1]}) * 0.00062137119 > milesInput) {
				continue
			}
			if (numUpVotesInput != "" && users[i].totalUpVotes < numUpVotesInput) {
				continue
			}
			matchedUsers.push(users[i])
		}
		res.send(matchedUsers)
	}).catch(next)
})

//get a tree from the db
router.get('/trees/:id', function(req, res, next) {
	Tree.findOne({_id: req.params.id}).then(function(tree) {
		res.send(tree)
	}).catch(next)
})

//get a track from the db
router.get('/trees/:id/:trackid', function(req, res, next) {
	Tree.findOne({_id: req.params.id}).then(function(tree) {
		var tracksTreeX = tree.tracks
		var trackNodeX = TreeClass.prototype.search(tracksTreeX._root, "trackID", req.params.trackid)
		res.send(trackNodeX.data)
	}).catch(next)
})

//get a user from the db
router.get('/users/:username', function(req, res, next) {
	Tree.findOne({username: req.params.username}).then(function(user) {
		res.send(user)
	}).catch(next)
})

//add a new tree to the db
router.post('/trees', function(req, res, next) {
	if (req.body.treeName == undefined) {
		res.send("Tree name is a required field.")
		return
	}
	else if (req.body.bpm == undefined) {
		res.send("BPM is a required field.")
		return
	}
	else {
		Tree.create(req.body).then(function(tree) {
			res.send(tree)
    	}).catch(next)
	}
})

//add new user
router.post('/users', function(req, res, next) {
	User.create(req.body).then(function(user) {
		if (user.location !== "") {
			geocoder.geocode(user.location).then(function(locationData) {
				User.findByIdAndUpdate(user._id, {locationCoord: [locationData[0].latitude, locationData[0].longitude]}).then(function(newuser) {
					res.send(newuser)
				}).catch(next)
			}).catch(next)
		}
		else {
			res.send(user)
		}
	}).catch(next)
})

//edit user location
router.put('/users/:username/changelocation', function(req, res, next) {
	User.findOne({username: req.params.username}).then(function(user) {
		geocoder.geocode(req.body.location).then(function(locationData) {
			User.findByIdAndUpdate(user._id, {location: req.body.location, locationCoord: [locationData[0].latitude, locationData[0].longitude]}).then(function(newuser) {
				res.send(newuser)
			}).catch(next)
		}).catch(next)
	}).catch(next)
})

//update user tree field
router.put('/users/:username/addtree', function(req, res, next) {
	User.findOne({username: req.params.username}).then(function(user) {
		var newTreesList = user.trees
		newTreesList.push(req.body.treeName)
		User.findByIdAndUpdate(user._id, {trees: newTreesList}).then(function(x) {
			res.send(req.params.username)
		}).catch(next)
	}).catch(next)
})

//add a new track to an existing tree in the db
router.post('/trees/:id/:trackid', function(req, res, next) {
	if (req.body.newInstrument == undefined) {
		res.send("instrument is a required field.")
		return
	}
	Tree.findOne({_id: req.params.id}).then(function(tree) {
		if (tree.tracks == undefined) {
			var newTracks = new TreeClass(req.body)
			Tree.findByIdAndUpdate(req.params.id, 
			{tracks: newTracks, numTracks: 1, collaboratorNames: req.body.createdBy, 
		 	 instruments: req.body.newInstrument, genres: req.body.newGenre}).then(function(tree) {
				res.send(req.body)
		}).catch(next)
			return
		}
		var tracksTreeX = tree.tracks
		var trackNodeX = TreeClass.prototype.search(tracksTreeX._root, "trackID", req.params.trackid)
		TreeClass.prototype.add(trackNodeX, req.body)
		if (!tree.collaboratorNames.map(c => c.toLowerCase()).includes(req.body.createdBy.toLowerCase())) {
			tree.collaboratorNames.push(req.body.createdBy)
		}
		if (!tree.instruments.map(i => i.toLowerCase()).includes(req.body.newInstrument.toLowerCase())) {
			tree.instruments.push(req.body.newInstrument)
		}
		if (req.body.newGenre != undefined && !tree.genres.map(g => g.toLowerCase()).includes(req.body.newGenre.toLowerCase())) {
			tree.genres.push(req.body.newGenre)
		}
		Tree.findByIdAndUpdate(req.params.id, 
		{tracks: tracksTreeX, numTracks: tree.numTracks + 1, collaboratorNames: tree.collaboratorNames, 
		 instruments: tree.instruments, genres: tree.genres}).then(function(x) {
			res.send(req.body)
		}).catch(next)
	}).catch(next)
})

//modify the user's data after adding track
router.put('/users/:username/addtrack', function(req, res, next) {
	findOne({username: req.params.username}).then(function(user) {
		var newTracksList = user.tracks
		newTracksList.push(req.body.trackID)
		var newInstrumentsList = user.instruments
		if (!newInstrumentsList.map(i => i.toLowerCase()).includes(req.body.newInstrument.toLowerCase())) {newInstrumentsList.push(req.body.newInstrument)}
		var newGenresList = user.genres
		if (!newGenresList.map(i => i.toLowerCase()).includes(req.body.newGenre.toLowerCase())) {newGenresList.push(req.body.newGenre)}
		findByIdAndUpdate(user._id, {tracks: newTracksList, numTracks: user.numTracks + 1, 
									 instruments: newInstrumentsList, genres: newGenresList}).then(function(newuser) {
			res.send(newuser)
		}).catch(next)
	}).catch(next)
})

//add a new instrument
router.post('/instruments', function(req, res, next) {
	Instrument.find({instrument: req.body.instrument}).then(function(instruments) {
		if (instruments.length == 0) {
			Instrument.create(req.body)
		}
		res.send(req.body.instrument)
	}).catch(next)
})

//add a new genre
router.post('/genres', function(req, res, next) {
	Genre.find({genre: req.body.genre}).then(function(genres) {
		if (genres.length == 0) {
			Genre.create(req.body)
		}
		res.send(req.body.genre)
	}).catch(next)
})

//delete a track from a tree in the db
router.delete('/trees/:id/:trackid', function(req, res, next) {
	Tree.findOne({_id: req.params.id}).then(function(tree) {
		var tracksTreeX = tree.tracks
		var trackNodeX = TreeClass.prototype.search(tracksTreeX._root, "trackID", req.params.trackid)
		var trackObjX = trackNodeX.data
		TreeClass.prototype.remove(tracksTreeX._root, "trackID", req.params.trackid)
		if (TreeClass.prototype.search(tracksTreeX._root, "createdBy", trackObjX.createdBy) == null) {
			tree.collaboratorNames.splice(tree.collaboratorNames.indexOf(trackObjX.createdBy), 1)
		}
		if (TreeClass.prototype.search(tracksTreeX._root, "newInstrument", trackObjX.newInstrument) == null) {
			tree.instruments.splice(tree.instruments.indexOf(trackObjX.newInstrument), 1)
		}
		if (trackObjX.newGenre != undefined && TreeClass.prototype.search(tracksTreeX._root, "newGenre", trackObjX.newGenre) == null) {
			tree.genres.splice(tree.genres.indexOf(trackObjX.newGenre), 1)
		}
		var numChildren = TreeClass.prototype.getNumChildren(trackNodeX)
		Tree.findByIdAndUpdate(req.params.id,
		{tracks: tracksTreeX, numTracks: tree.numTracks - (1 + numChildren), collaboratorNames: tree.collaboratorNames,
		instruments: tree.instruments, genres: tree.genres, totalUpVotes: tree.totalUpVotes - trackObjX.upVotes}).then(function(tree) {
			res.send(trackObjX)
		}).catch(next)
	}).catch(next)
})

//modify the user's data after deleting track
router.put('/users/:username/deletetrack', function(req, res, next) {
	findOne({username: req.params.username}).then(function(user) {
		var newTracksList = user.tracks.splice(user.tracks.indexOf(req.body.trackID), 1)
		findByIdAndUpdate(user._id, {tracks: newTracksList, numTracks: user.numTracks - 1, 
									 totalTrackUpVotes: user.totalTrackUpVotes - req.body.upVotes}).then(function(newuser) {
			res.send(newuser)
		}).catch(next)
	}).catch(next)
})

//delete an instrument from the db
router.delete('/instruments/:instrument', function(req, res, next) {
	Tree.find({}).then(function(trees) {
		for (var i = 0; i < trees.length; i++) {
			if (trees[i].instruments.includes(req.params.instrument)) {
				return
			}
		}
		Instrument.collection.remove({instrument: req.params.instrument})
	})
})

//delete a genre from the db
router.delete('/genres/:genre', function(req, res, next) {
	Tree.find({}).then(function(trees) {
		for (var i = 0; i < trees.length; i++) {
			if (trees[i].genres.includes(req.params.genre)) {
				return
			}
		}
		Genre.collection.remove({genre: req.params.genre})
	})
})

//delete a tree from the db
router.delete('/trees/:id', function(req, res, next) {
	Tree.findByIdAndRemove({_id: req.params.id}).then(function(tree) {
		res.send(tree)
	}).catch(next)
})

//delete a tree from users' data
router.post('/users/:treename/deletetree', function(req, res, next) {
	for (var i = 0; i < req.body.collaboratorNames.length; i++) {
		User.findOne({username: req.body.collaboratorNames[i]}).then(function(user) {
			User.findByIdAndUpdate(user._id, {trees: user.trees.splice(user.trees.indexOf(req.params.treeName), 1)}).catch(next)
		}).catch(next)
	}
	res.send(req.params.treeName)
})

//upvote button- update tree and track upvote numbers
router.put('/trees/:id/:trackid/upvote', function(req, res, next) {
	Tree.findOne({_id: req.params.id}).then(function(tree) {
		var tracksTreeX = tree.tracks
		var TrackObjX = TreeClass.prototype.search(tree._root, "trackID", req.params.trackid)
		trackObjX.upVotes += 1
		Tree.findByIdAndUpdate(user._id, {totalUpVotes: tree.totalUpVotes + 1, tracks: tracksTreeX}).then(function(newtree) {
			res.send(newtree)
		}).catch(next)
	}).catch(next)
})

//update users' total track up votes, used when a track is up voted
router.put('/users/upvote', function(req, res, next) {
	for (var i = 0; i < req.body.collaboratorNames.length; i++) {
		User.findOne({username: req.body.collaboratorNames[i]}).then(function(user) {
			User.findByIdAndUpdate(user._id, {totalTrackUpVotes: user.totalTrackUpVotes + 1}).catch(next)
		}).catch(next)
	}
	res.send(req.body.collaboratorNames)
})

module.exports = router

