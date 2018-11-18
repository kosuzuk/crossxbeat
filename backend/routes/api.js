const express = require('express')
const router = express.Router()
const Tree = require('../models/Tree')

function NodeClass(data) {
    this.data = data
    this.parent = null
    this.children = []
}

function TreeClass(data) {
    var node = new Node(data)
    this._root = node
    this.search = function(curNode, dataParam, key){
    	if (curNode.data[dataParam] == key){
    		return curNode.data
    	}
    	else if (curNode.children == []){
    		return null
    	}
    	else {
    		var res = null
    		var temp = null
    		for (var i = 0; curNode.children.length; i++) {
    			temp = this.search(curNode.children[i], dataParam, key)
    			if (temp != null) {res = temp}
    		}
    		return res
    	}
    }
    this.add = function(curNode, newData){
    	var newNode = new Node(newData)
    	curNode.children.push(newNode)
    	newNode.parent = curNode
    }
    this.remove = function(curNode, dataParam, key){
    	var nodeList = this.search(curNode, dataParam, key).parent.children
    	for (var i = 0; nodeList.length; i++) {
    		if (nodeList[i].data.dataParam == key){
    			var index = i
    			break
    		}
    	}
    	nodeList.splice(i, 1)
    }
    this.getNumChildren = function(curNode){
    	if (curNode.children == []){
    		return 0
    	}
    	else {
    		var res = 0
    		for (var i = 0; curNode.children.length; i++) {
    			res += getNumChildren(curNode.children[i])
    		}
    		return curNode.children.length + res
    	}
    }
}

//get every tree from the db
router.get('/', function(req, res, next) {
	Tree.find({}).then(function(allTrees){
		res.send(allTrees)
	})
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
		var tracksX = tree.tracks
		var trackX = tracksX.search(tracksX._root, "_id", req.params.trackid)
		res.send(trackX)
	}).catch(next)
})

//add a new tree to the db
router.post('/trees', function(req, res, next){
	if (req.body.name == ""){
		res.send("error: name is a required field.")
	}
	else {
		Tree.create(req.body).then(function(tree){
			res.send(tree)
    	}).catch(next)	
	}
})

//add a new track to an existing track in the db
router.post('/trees/:id/:trackid', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		var tracksX = tree.tracks
		var trackX = tracksX.search(tracksX._root, "_id", req.params.trackid)
		tracksX.add(trackX, req.body)
		if !(tree.collaboratorNames.includes(trackX.createdBy)){
			tree.collaboratorNames.push(trackX.createdBy)
		}
		if !(tree.instruments.includes(trackX.newInstrument)){
			tree.instruments.push(trackX.newInstrument)
		}
		if !(tree.genres.includes(trackX.newGenre)){
			tree.genres.push(trackX.newGenre)
		}
		Tree.findByIdAndUpdate(req.params.id, 
		{tracks: tracksX, numTracks: tree.numTracks + 1, collaboratorNames: tree.collaboratorNames, 
		 instruments: tree.instruments, genres: tree.genres}).then(function(tree){
			res.send(req.body)
		}).catch(next)
	}).catch(next)
})

//delete a track from a tree in the db
router.delete('/trees/:id/:trackid', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		if (tree.tracks._root.data._id == req.params.trackid){
			router.delete('/trees/' + req.params.id)
			return
		}
		var tracksX = tree.tracks
		var trackX = tracksX.search(tracksX._root, "_id", req.params.trackid)
		tracksX.remove(trackX, "_id", req.params.trackid)
		if (tracksX.search(tracksX._root, "createdBy", trackX.createdBy) == null){
			tree.collaboratorNames.splice(tree.collaboratorNames.indexOf(trackX.createdBy), 1)
		}
		if (tracksX.search(tracksX._root, "newInstrument", trackX.newInstrument) == null){
			tree.instruments.splice(tree.instruments.indexOf(trackX.newInstrument), 1)
		}
		if (tracksX.search(tracksX._root, "newGenre", trackX.newGenre) == null){
			tree.genres.splice(tree.genres.indexOf(trackX.newGenre), 1)
		}
		var numChildren = tracksX.getNumChildren(trackX)
		Tree.findByIdAndUpdate(req.params.id,
		{tracks: tracksX, numTracks: tree.numTracks - (1 + numChildren), collaboratorNames: tree.collaboratorNames,
		instruments: tree.instruments, genres: tree.genres}).then(function(tree){
			res.send(deletedTrack)
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

