const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create track schema
const TrackSchema = new Schema({
	numCollaborators: {
		type: Number
	},
	collaboratorNames: {
		type: [String]
	}
})

//create song tree schema and model
const TreeSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name field is required']
	},
	numTracks: {
		type: Number
	},
	tracks: {
		type: [TrackSchema]
	}
})
const Tree = mongoose.model('tree', TreeSchema)
module.exports = Tree