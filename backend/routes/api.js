const express = require('express')
const router = express.Router()
const Tree = require('../models/Tree')

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
TreeClass.prototype.search = function(curNode, dataParam, key){
	if (curNode.data[dataParam] == key){
		return curNode
	}
	else if (curNode.children == []){
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
TreeClass.prototype.add = function(curNode, newData){
	var newNode = new NodeClass(newData)
	curNode.children.push(newNode)
}

//remove a track node from a tree, assumes root is not the node being removed
TreeClass.prototype.remove = function(curNode, dataParam, key){
	var nodeList = curNode.children
	for (var i = 0; i < nodeList.length; i++) {
		if (nodeList[i].data[dataParam] == key){
			nodeList.splice(i, 1)
			return 1
		}
	}
	for (var i = 0; i < nodeList.length; i++) {
		if (TreeClass.prototype.remove(nodeList[i], dataParam, key) == 1){
			return 1
		}
	}
	return 0
}

//get the number of children of a specified node(number of tracks created from that track)
TreeClass.prototype.getNumChildren = function(curNode){
	if (curNode.children == []){
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
router.get('/', function(req, res, next) {
	Tree.find({}).then(function(allTrees){
		res.send(allTrees)
	}).catch(next)
})

//get searched trees from the db
router.get('/input', function(req, res, next) {

})

//get a song tree from the db
router.get('/trees/:id', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		res.send(tree)
	}).catch(next)
})

//get a track from the db
router.get('/trees/:id/:trackid', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		var tracksTreeX = tree.tracks
		var trackNodeX = TreeClass.prototype.search(tracksTreeX._root, "trackID", req.params.trackid)
		res.send(trackNodeX.data)
	}).catch(next)
})

//add a new tree to the db
router.post('/trees', function(req, res, next){
	if (req.body.treeName == undefined){
		res.send("Tree name is a required field.")
		return
	}
	else if (req.body.bpm == undefined){
		res.send("BPM is a required field.")
		return
	}
	else {
		Tree.create(req.body).then(function(tree){
			res.send(tree)
    	}).catch(next)
	}
})

//add a new track to an existing tree in the db
router.post('/trees/:id/:trackid', function(req, res, next){
	if (req.body.newInstrument == undefined){
		res.send("instrument is a required field.")
		return
	}
	Tree.findOne({_id: req.params.id}).then(function(tree){
		if (tree.tracks == undefined){
			var newTracks = new TreeClass(req.body)
			Tree.findByIdAndUpdate(req.params.id, 
			{tracks: newTracks, numTracks: 1, collaboratorNames: req.body.createdBy, 
		 	 instruments: req.body.newInstrument, genres: req.body.newGenre}).then(function(tree){
				res.send(req.body)
		}).catch(next)
			return
		}
		var tracksTreeX = tree.tracks
		var trackNodeX = TreeClass.prototype.search(tracksTreeX._root, "trackID", req.params.trackid)
		TreeClass.prototype.add(trackNodeX, req.body)
		if (!tree.collaboratorNames.includes(req.body.createdBy)){
			tree.collaboratorNames.push(req.body.createdBy)
		}
		if (!tree.instruments.includes(req.body.newInstrument)){
			tree.instruments.push(req.body.newInstrument)
		}
		if (req.body.newGenre != undefined && !tree.genres.includes(req.body.newGenre)){
			tree.genres.push(req.body.newGenre)
		}
		Tree.findByIdAndUpdate(req.params.id, 
		{tracks: tracksTreeX, numTracks: tree.numTracks + 1, collaboratorNames: tree.collaboratorNames, 
		 instruments: tree.instruments, genres: tree.genres}).then(function(x){
			res.send(req.body)
		}).catch(next)
	}).catch(next)
})

//delete a track from a tree in the db
router.delete('/trees/:id/:trackid', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		if (tree.tracks._root.data.trackID == req.params.trackid){
			router.delete('/trees/' + req.params.id)
			return
		}
		var tracksTreeX = tree.tracks
		var trackNodeX = TreeClass.prototype.search(tracksTreeX._root, "trackID", req.params.trackid)
		var trackObjX = trackNodeX.data
		TreeClass.prototype.remove(tracksTreeX._root, "trackID", req.params.trackid)
		if (TreeClass.prototype.search(tracksTreeX._root, "createdBy", trackObjX.createdBy) == null){
			tree.collaboratorNames.splice(tree.collaboratorNames.indexOf(trackObjX.createdBy), 1)
		}
		if (TreeClass.prototype.search(tracksTreeX._root, "newInstrument", trackObjX.newInstrument) == null){
			tree.instruments.splice(tree.instruments.indexOf(trackObjX.newInstrument), 1)
		}
		if (trackObjX.newGenre != undefined && TreeClass.prototype.search(tracksTreeX._root, "newGenre", trackObjX.newGenre) == null){
			tree.genres.splice(tree.genres.indexOf(trackObjX.newGenre), 1)
		}
		var numChildren = TreeClass.prototype.getNumChildren(trackNodeX)
		Tree.findByIdAndUpdate(req.params.id,
		{tracks: tracksTreeX, numTracks: tree.numTracks - (1 + numChildren), collaboratorNames: tree.collaboratorNames,
		instruments: tree.instruments, genres: tree.genres}).then(function(tree){
			res.send(trackObjX)
		}).catch(next)
	}).catch(next)
})

//delete a tree from the db
router.delete('/trees/:id', function(req, res, next){
	Tree.findByIdAndRemove({_id: req.params.id}).then(function(tree){
		res.send(tree)
	}).catch(next)
})

module.exports = router

