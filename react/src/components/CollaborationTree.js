import React from "react"

class CollaborationTree extends React.Component {
	render() {
		return (
			<div>
				This is the collaboration tree screen.
				<form onSubmit = {this.props.changeContent} className = "switchToHome">
					<button>Press for Home!</button>
				</form>
				<form onSubmit = {this.props.changeContent} className = "switchToAdvancedSearch">
					<button>Press for Advanced Search!</button>
				</form>
				{this.props.error && <div>error!</div>}
			</div>
		)
	}
}

export default CollaborationTree