const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create track schema
const TrackSchema = new Schema({
	trackID: {
		type: Number
	},
	collaboratorNames: {
		type: [String]
	},
	createdBy: {
		type: String
	},
	comment: {
		type: String
	},
	dateCreated: {
		type: String
	},
	instruments: {
		type: [String],
		required: [true, 'instrument field is required']
	},
	genres: {
		type: [String]
	},
	upVotes: {
		type: Number
	}
})

//create song tree schema and model
const TreeSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name field is required']
	},
	tracks: {
		type: Schema.Types.Mixed
	},
	numTracks: {
		type: Number
	},
	collaboratorNames: {
		type: [String]
	},
	instruments: {
		type: [String]
	},
	genres: {
		type: [String]
	},
	BPM: {
		type: Number,
		required: [true, 'BPM field is required']
	}
})

const Tree = mongoose.model('tree', TreeSchema)
module.exports = Tree