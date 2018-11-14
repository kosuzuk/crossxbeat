import React from "react"
import axios from 'axios'
import Dropdown from 'react-dropdown'
import 'react-dropdown/dropdownStyle.css'

const options = [
  'Profile', 'Record', 'Generator', 'Settings', 'Feedback'
]
class Home extends React.Component {
    state = {
        Trees: []
    }
    componentDidMount() {
   		fetch("/api")
        .then(res => res.json())
        .then(res => this.setState({Trees: res}))
    }
	simpleSearch = (event) => {
    	event.preventDefault()
    	const input = event.target.elements.searchBar.value
		if (input === "") {
			return
		}
		axios.fetch('/api/' + input)
		.then(res => {
			//.then(res => res.json())
        	//.then(res => this.setState({Trees: res}))
		})
	}
	createNewTree = (event) => {
    	event.preventDefault()
	}
	dropdownClick = (event) => {
		console.log("dropdown option clicked")
		this.props.changeScreen(event)
	}
	render() {
		return (
			<div>
				This is the home screen.
				<form onSubmit = {this.createNewTree}>
					<button id = "createNewButton">+</button>
					<div id = "createNewText">
				    	Create A New Tree
					</div>
				</form>
				<form onSubmit = {this.simpleSearch}>
					<input id = "searchBar" placeholder = "type username, track..." />
					<button id = "searchButton">search</button>
				</form>
				<form onSubmit = {this.props.changeScreen}>
					<button id = "advancedSearchButton">Try Advanced Search!</button>
				</form>
				{this.props.error && <div>error!</div>}
				<Dropdown id = "dropdown" options = {options} onChange = {this.dropdownClick} placeholder = "Select an option" />
				<div id = "existingTrees">
                    {this.state.Trees.map(tree => <li>{tree.name}, Collabortors: {tree.collaboratorNames}</li>)}
                </div>
			</div>
		)
	}
}

export default Home