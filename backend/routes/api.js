const express = require('express')
const router = express.Router()
const Tree = require('../models/Tree')

//get every tree from the db
router.get('/', function(req, res, next) {
	Tree.find({}).then(function(allTrees){
		res.send(allTrees)
	})
});

//get searched trees from the db
router.get('/input', function(req, res, next) {

});

//get a song tree from the db
router.get('/trees/:id', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		res.send(tree)
	}).catch(next)
})

//get a track from the db
router.get('/trees/:id/:trackid', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		var tracksList = tree.tracks
		for (var i = 0; i < tracksList.length; i++){
			if (tracksList[i]._id == req.params.trackid){
				var track = tracksList[i]
				break
			}
		}
		res.send(track)
	}).catch(next)
})

//add a new tree to the db
router.post('/trees', function(req, res, next){
	if (req.body.name == ""){
		res.send("error: name is a required field.")
	}
	else {
		req.body.numTracks = 0
		req.body.tracks = []
		Tree.create(req.body).then(function(tree){
			res.send(tree)
    	}).catch(next)	
	}
})

//add a new track to a tree in the db
router.post('/trees/:id', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		var newTracksList = tree.tracks
		newTracksList.push(req.body)
		Tree.findByIdAndUpdate(req.params.id, {tracks: newTracksList, numTracks: tree.numTracks + 1}).then(function(tree){
			res.send(req.body)
		}).catch(next)
	}).catch(next)
})

//delete a track from a tree in the db
router.delete('/trees/:id/:trackid', function(req, res, next){
	Tree.findOne({_id: req.params.id}).then(function(tree){
		var newTracksList = tree.tracks
		for (var i = 0; i < newTracksList.length; i++){
			if (newTracksList[i]._id == req.params.trackid){
				var deletedTrack = newTracksList[i]
				newTracksList.splice(newTracksList.indexOf(deletedTrack), 1)
				break
			}
		}
		Tree.findByIdAndUpdate(req.params.id, {tracks: newTracksList, numTracks: tree.numTracks - 1}).then(function(tree){
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

