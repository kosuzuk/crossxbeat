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
		for (var i = 0; i < str.length; i++) {
			if (48 > str.charCodeAt(i) || 57 < str.charCodeAt(i)) {
				return true
			}
		}
		return false
	}
	advancedSearchSubmit = (event) => {
    	event.preventDefault()
    	var inputs = {
			collaboratorNamesInput: event.target.elements.collaboratorNamesInput.value.replace(/\s/g, '').toLowerCase(),
			numTracksInputLower: event.target.elements.numTracksInputLower.value.replace(/\s/g, ''),
			numTracksInputUpper: event.target.elements.numTracksInputUpper.value.replace(/\s/g, ''),
			bpmInputLower: event.target.elements.bpmInputLower.value.replace(/\s/g, ''),
			bpmInputUpper: event.target.elements.bpmInputUpper.value.replace(/\s/g, ''),
			milesInput: event.target.elements.milesInput.value.replace(/\s/g, ''),
			numUpVotesInput: event.target.elements.numUpVotesInput.value.replace(/\s/g, '')
		}
		if (this.notAllNumbers(inputs.numTracksInputLower) || this.notAllNumbers(inputs.numTracksInputUpper) ||
			this.notAllNumbers(inputs.bpmInputLower) || this.notAllNumbers(inputs.bpmInputUpper) ||
			this.notAllNumbers(inputs.milesInput) || this.notAllNumbers(inputs.numUpVotesInput)) {
			this.setState({error: true})
		}
		else {
			this.setState({error: false})
			this.closeModal()
			this.props.advancedSearchSubmit(inputs)
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
					<div>Musicians within x miles from me:</div>
					<input id = "milesInput" style = {{width:"4%"}}/>
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
