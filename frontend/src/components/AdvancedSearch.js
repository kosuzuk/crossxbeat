import React from 'react'
import Modal from 'react-modal'

const customStyles = {
	top: "70%"
}

class AdvancedSearch extends React.Component {
	constructor() {
		super()
		this.state = {
			modalIsOpen: false,
			searching: "trees",
			searchTreesButtonColor: "#999",
			searchUsersButtonColor: "#fff",
			displayedInstruments: [],
			displayedGenres: [],
			selectedInstruments: [],
			selectedGenres: [],
			instrumentButtonColors: [],
			genreButtonColors: [],
			nonSearch: false,
			inputOnFocus: false,
			error: false
		}
		this.openModal = this.openModal.bind(this)
		this.afterOpenModal = this.afterOpenModal.bind(this)
		this.closeModal = this.closeModal.bind(this)
	}
	setColors(n) {
		var arr = []
		for (var i = 0; i < n; i++) {
			arr.push("#fff")
		}
		return arr
	}
	componentDidMount() {
   		fetch('/api/instruments')
        .then(res => res.json())
        .then(res => this.setState({displayedInstruments: res, instrumentButtonColors: this.setColors(res.length)}))
        fetch('/api/genres')
        .then(res => res.json())
        .then(res => this.setState({displayedGenres: res, genreButtonColors: this.setColors(res.length)}))
    }
	openModal() {
		this.setState({modalIsOpen: true})
	}
	afterOpenModal() {
		// references are now sync'd and can be accessed.
		this.subtitle.style.color = "#000"
	}
	closeModal() {
		this.setState({selectedInstruments: [], selectedGenres: [], instrumentButtonColors: this.setColors(this.state.displayedInstruments.length), 
					   genreButtonColors: this.setColors(this.state.displayedGenres.length), error: false, modalIsOpen: false})
	}
	notAllNumbers(str) {
		for (var i = 0; i < str.length; i++) {
			if (48 > str.charCodeAt(i) || 57 < str.charCodeAt(i)) {
				return true
			}
		}
		return false
	}
	searchTreesOnClick = (event) => {
		this.setState({searching: "trees", searchTreesButtonColor: "#999", searchUsersButtonColor: "#fff", 
					   selectedInstruments: [], selectedGenres: [], instrumentButtonColors: this.setColors(this.state.displayedInstruments.length), 
					   genreButtonColors: this.setColors(this.state.displayedGenres.length), error: false})
	}
	searchUsersOnClick = (event) => {
		this.setState({searching: "users", searchTreesButtonColor: "#fff", searchUsersButtonColor: "#999", 
					   selectedInstruments: [], selectedGenres: [], instrumentButtonColors: this.setColors(this.state.displayedInstruments.length), 
					   genreButtonColors: this.setColors(this.state.displayedGenres.length), error: false})
	}
	onFocus = (event) => {
    	this.setState({inputOnFocus: true})
	}
	onBlur = (event) => {
    	this.setState({inputOnFocus: false})
	}
	instrumentButtonOnClick = (event) => {
		if (this.state.inputOnFocus) {return}
		var instruments = this.state.displayedInstruments
		var colors = this.state.instrumentButtonColors
		var instrumentNumber = 0
		for (var i = 0; i < instruments.length; i++) {
			if (instruments[i].instrument === event.target.className) {
				instrumentNumber = i
				break
			}
		}
		var selected = this.state.selectedInstruments
		if (colors[instrumentNumber] === "#fff") {
			selected.push(instruments[instrumentNumber])
			colors[instrumentNumber] = "#999"
		}
		else {
			for (i = 0; i < selected.length; i++) {
				if (selected[i].instrument === event.target.className) {
					selected.splice(i, 1)
					break
				}
			}
			colors[instrumentNumber] = "#fff"
		}
		this.setState({selectedInstruments: selected, instrumentButtonColors: colors, nonSearch: true})
	}
	genreButtonOnClick = (event) => {
		var genres = this.state.displayedGenres
		var colors = this.state.genreButtonColors
		var genreNumber = 0
		for (var i = 0; i < genres.length; i++) {
			if (genres[i].genre === event.target.className) {
				genreNumber = i
				break
			}
		}
		var selected = this.state.selectedGenres
		if (colors[genreNumber] === "#fff") {
			selected.push(genres[genreNumber])
			colors[genreNumber] = "#999"
		}
		else {
			for (var j = 0; j < selected.length; j++) {
				if (selected[j].genre === event.target.className) {
					selected.splice(j, 1)
					break
				}
			}
			colors[genreNumber] = "#fff"
		}
		this.setState({selectedGenres: selected, genreButtonColors: colors, nonSearch: true})
	}
	advancedSearchSubmit = (event) => {
    	event.preventDefault()
    	if (this.state.nonSearch) {
    		this.setState({nonSearch: false})
    		return
    	}
    	var insToBeSent = []
    	for (var i = 0; i < this.state.selectedInstruments.length; i++) {
    		insToBeSent.push(this.state.selectedInstruments[i].instrument.toLowerCase())
    	}
    	var genresToBeSent = []
    	for (i = 0; i < this.state.selectedGenres.length; i++) {
    		genresToBeSent.push(this.state.selectedGenres[i].genre.toLowerCase())
    	}
    	var inputs
    	if (this.state.searching === "trees") {
    		inputs = {
				collaboratorNamesInput: event.target.elements.collaboratorNamesInput.value.replace(/\s/g, '').toLowerCase(),
				instrumentsInput: insToBeSent,
				genresInput: genresToBeSent,
				numTracksInputLower: event.target.elements.numTracksInputLower.value.replace(/\s/g, ''),
				numTracksInputUpper: event.target.elements.numTracksInputUpper.value.replace(/\s/g, ''),
				bpmInputLower: event.target.elements.bpmInputLower.value.replace(/\s/g, ''),
				bpmInputUpper: event.target.elements.bpmInputUpper.value.replace(/\s/g, ''),
				numUpVotesInput: event.target.elements.numUpVotesInput.value.replace(/\s/g, '')
			}
			if (this.notAllNumbers(inputs.numTracksInputLower) || this.notAllNumbers(inputs.numTracksInputUpper) ||
				this.notAllNumbers(inputs.bpmInputLower) || this.notAllNumbers(inputs.bpmInputUpper) ||
				this.notAllNumbers(inputs.numUpVotesInput)) {
				this.setState({error: true})
				return
			}
		}
		else {
			inputs = {
				usernameInput: event.target.elements.usernameInputU.value.replace(/\s/g, '').toLowerCase(),
				instrumentsInput: insToBeSent,
				genresInput: genresToBeSent,
				milesInput: event.target.elements.milesInputU.value.replace(/\s/g, ''),
				numUpVotesInput: event.target.elements.numUpVotesInputU.value.replace(/\s/g, '')
			}
			if (this.notAllNumbers(inputs.milesInput) || this.notAllNumbers(inputs.numUpVotesInput)) {
				this.setState({error: true})
				return
			}
		}
		this.setState({inputOnFocus: false, error: false})
		this.closeModal()
		this.props.advancedSearchSubmit(inputs)
	}
	render() {
		return (
		<div>
		<button onClick = {this.openModal} id = "advancedSearchButton">Try advanced search!</button>
			<Modal
			 isOpen = {this.state.modalIsOpen}
			 onAfterOpen = {this.afterOpenModal}
			 onRequestClose = {this.closeModal}
			 style = {customStyles}
			 contentLabel = "advancedSearchModal"
			 ariaHideApp = {false}
			>
				<h2 ref = {subtitle => this.subtitle = subtitle}>Advanced Search</h2>
				<div>(search for trees and tracks or users matching all of the fields)</div>
				<button id = "searchTreesButton" style = {{background: this.state.searchTreesButtonColor}} onClick = {this.searchTreesOnClick}>search for trees</button>
				<button id = "searchUsersButton" style = {{background: this.state.searchUsersButtonColor}} onClick = {this.searchUsersOnClick}>search for musicians</button>
				{this.state.searching === "trees" && <form onSubmit = {this.advancedSearchSubmit}>
					<div>usernames separated by commas:</div>
					<input id = "collaboratorNamesInput" style = {{width: "50%"}} onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					<div>Instruments:</div>
						{this.state.displayedInstruments.map(instrument => <button id = "instrumentButton" className = {instrument.instrument} key = {instrument.instrument} 
						 style = {{background: this.state.instrumentButtonColors[this.state.displayedInstruments.indexOf(instrument)]}} onClick = {this.instrumentButtonOnClick}>{instrument.instrument}</button>)}
					<div>Genres:</div>
						{this.state.displayedGenres.map(genre => <button id = "genreButton" className = {genre.genre} key = {genre.genre} 
						 style = {{background: this.state.genreButtonColors[this.state.displayedGenres.indexOf(genre)]}} onClick = {this.genreButtonOnClick}>{genre.genre}</button>)}
					<div>Number of tracks:</div>
					<input id = "numTracksInputLower" onFocus = {this.onFocus} onBlur = {this.onBlur}/> to <input id = "numTracksInputUpper" onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					<div>BPM:</div>
					<input id = "bpmInputLower" onFocus = {this.onFocus} onBlur = {this.onBlur}/> to <input id = "bpmInputUpper" onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					<div>Number of upvotes, more than:</div>
					<input id = "numUpVotesInput" onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					{this.state.error && <div style = {{color: "red"}}>Please only enter numbers for the number of tracks, BPM and number of upvotes fields.</div>}
					<div></div>
					<button id = "treeSearchButton" style = {{float: "left", marginRight: "8px"}}>search</button>
				</form>}
				{this.state.searching === "users" && <form onSubmit = {this.advancedSearchSubmit}>
					<div>username:</div>
					<input id = "usernameInputU" style = {{width: "50%"}} onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					<div>Instruments:</div>
						{this.state.displayedInstruments.map(instrument => <button id = "instrumentButton" className = {instrument.instrument} key = {instrument.instrument} 
						 style = {{background: this.state.instrumentButtonColors[this.state.displayedInstruments.indexOf(instrument)]}} onClick = {this.instrumentButtonOnClick}>{instrument.instrument}</button>)}
					<div>Genres:</div>
						{this.state.displayedGenres.map(genre => <button id = "genreButton" className = {genre.genre} key = {genre.genre} 
						 style = {{background: this.state.genreButtonColors[this.state.displayedGenres.indexOf(genre)]}} onClick = {this.genreButtonOnClick}>{genre.genre}</button>)}
					<div>Musicians within x miles from me:</div>
					<input id = "milesInputU" onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					<div>Number of upvotes, more than:</div>
					<input id = "numUpVotesInputU" onFocus = {this.onFocus} onBlur = {this.onBlur}/>
					{this.state.error && <div style = {{color: "red"}}>Please only enter numbers for the miles and number of upvotes fields.</div>}
					<div></div>
					<button id = "userSearchButton" style = {{float: "left", marginRight: "8px"}}>search</button>
				</form>}
				<button onClick = {this.closeModal}>close</button>
			</Modal>
		</div>
		)
	}
}

export default AdvancedSearch
