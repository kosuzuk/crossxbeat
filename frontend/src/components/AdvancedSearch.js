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
			error: false
		}
		this.openModal = this.openModal.bind(this)
		this.afterOpenModal = this.afterOpenModal.bind(this)
		this.closeModal = this.closeModal.bind(this)
	}
	openModal() {
		this.setState({modalIsOpen: true})
	}
	afterOpenModal() {
		// references are now sync'd and can be accessed.
		this.subtitle.style.color = "#000"
	}
	closeModal() {
		this.setState({error: false})
		this.setState({modalIsOpen: false})
	}
	notAllNumbers(str) {
		str = str.replace(/\s/g, '')
		for (var i = 0; i < str.length; i++) {
			if (48 > str.charCodeAt(i) || 57 < str.charCodeAt(i)) {
				return true
			}
		}
		return false
	}
	advancedSearchSubmit = (event) => {
    	event.preventDefault()
    	var inputs = event.target.elements
		if (this.notAllNumbers(inputs.numTracksInputLower.value) || this.notAllNumbers(inputs.numTracksInputUpper.value) ||
			this.notAllNumbers(inputs.bpmInputLower.value) || this.notAllNumbers(inputs.bpmInputUpper.value) ||
			this.notAllNumbers(inputs.numUpVotesInput.value)) {
			this.setState({error: true})
		}
		else {
			this.setState({error: false})
			this.closeModal()
			this.props.advancedSearchSubmit(event)
		}
	}
	render() {
		return (
		<div>
		<button onClick={this.openModal} id = "advancedSearchButton">Try advanced search!</button>
			<Modal
			 isOpen = {this.state.modalIsOpen}
			 onAfterOpen = {this.afterOpenModal}
			 onRequestClose = {this.closeModal}
			 style = {customStyles}
			 contentLabel = "advancedSearchModal"
			 ariaHideApp = {false}
			>
				<h2 ref = {subtitle => this.subtitle = subtitle}>Advanced Search</h2>
				<div>(search for trees and tracks matching all of the fields)</div>
				<form onSubmit = {this.advancedSearchSubmit}>
					<div>usernames separated by commas:</div>
					<input id = "collaboratorNamesInput" style={{width:"50%"}}/>
					<div>Instruments:</div>
					<div>Genres:</div>
					<div>Number of tracks:</div>
					<input id = "numTracksInputLower" style = {{width:"4%"}}/> to <input id = "numTracksInputUpper" style = {{width:"4%"}}/>
					<div>BPM:</div>
					<input id = "bpmInputLower" style={{width:"4%"}}/> to <input id = "bpmInputUpper" style = {{width:"4%"}}/>
					<div>Musicians near(type zip code or city):</div>
					<input id = "geoInput" style = {{width:"50%"}}/>
					<div>Number of upvotes, more than:</div>
					<input id = "numUpVotesInput" style={{width:"4%"}}/>
					{this.state.error && <div style = {{color:"red"}}>Please only enter numbers for the number of tracks, BPM, and number of upvotes fields.</div>}
					<button>search</button>
				</form>
				<button onClick = {this.closeModal}>close</button>
			</Modal>
		</div>
		)
	}
}

export default AdvancedSearch
