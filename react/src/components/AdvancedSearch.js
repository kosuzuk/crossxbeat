import React from "react"

class AdvancedSearch extends React.Component {
	render() {
		return (
			<div>
				This is the advanced search screen.
				<form onSubmit = {this.props.changeScreen} id = "switchToHome">
					<button>Press for Home!</button>
				</form>
				{this.props.error && <div>error!</div>}
			</div>
		)
	}
}

export default AdvancedSearch