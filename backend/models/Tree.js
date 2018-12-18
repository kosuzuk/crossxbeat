const mongoose = require('mongoose')
const Schema = mongoose.Schema


/*blueprint for track object
{
	trackID: {
		type: String
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
	},
	newInstrument: {
		type: String,
		required: [true, 'instrument field is required']
	},
	genres: {
		type: [String]
	},
	newGenre: {
		type: String
	},
	upVotes: {
		type: Number
	},
}
*/

//create song tree schema and model
const TreeSchema = new Schema({
	treeName: {
		type: String,
		required: [true, "Name field is required"]
	},
	tracks: {
		type: Schema.Types.Mixed
	},
	numTracks: {
		type: Number,
		default: 1
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
	bpm: {
		type: Number,
		required: [true, "BPM field is required"]
	},
	totalUpVotes: {
		type: Number,
		default: 0
	}
})

const Tree = mongoose.model("tree", TreeSchema)
module.exports = Tree