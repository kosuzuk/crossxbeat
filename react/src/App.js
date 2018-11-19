import React from "react"
import './App.css';
import Home from "./components/Home"
import AdvancedSearch from "./components/AdvancedSearch"

class App extends React.Component{
    state = {
        curPage: "home",
        nextTrackID: 0,
        error: false
    }
    changeScreen = (event) => {
        if (event.value !== undefined) {
            if (event.value === "Profile") {
                console.log("profile clicked")
            }
            return
        }
        event.preventDefault()
        if (event.target.id === "switchToAdvancedSearch") {
            this.setState({curPage: "advancedSearch",
            error: false})
        }
        else if (event.target.id === "switchToHome") {
            this.setState({curPage: "home",
            error: false})
        }
    }
    render() {
        return (
            <div>
                {this.state.curPage === "home" && 
                 <Home changeScreen = {this.changeScreen} nextTrackID = {this.state.nextTrackID} error = {this.state.error} />}
                {this.state.curPage === "advancedSearch" && 
                 <AdvancedSearch changeScreen = {this.changeScreen} nextTrackID = {this.state.nextTrackID} error = {this.state.error} />}
            </div>
        )
    }
}

export default App