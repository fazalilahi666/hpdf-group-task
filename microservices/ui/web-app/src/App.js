import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';

const style = {
  height: 60,
  width: '100%',
  fontSize: 40,
  paddingTop: 10,
  paddingBottom:10,  
  fontFamily: "monospace",
  textAlign: 'center',
  display: 'inline-block',
};

const hintStyle={
    color: 'blue',
    paddingBottom:13,
    paddingLeft:8,
    fontSize:12,
	fontcolor:'blue',
}

const inputStyle={
    position:'absolute',
    width: 170,
    height: 20,
    paddingLeft: 9,
    fontSize:12,
    marginTop:1
	
}

class App extends Component {
  render() {
    return (
	<div>	
		<Paper style={style} zDepth={5}>Team19_POA</Paper>
			<br/>
			<tt>                
				e.g. 'What is your name?', 'Thanks', 'My name is harsh'.
			</tt>
		<TextField
            underlineShow ={false}
            hintText="Search Twitter"
            hintStyle={hintStyle}
            inputStyle={inputStyle}							
        />
	<button onclick={this.on()} value="check">fasd</button>
	<form className="WitForm" onSubmit={this.changeOutput.bind(this)}>
        <input placeholder={this.showPlaceholder()} type="text" value={this.state.text} onChange={this.handleTextChange.bind(this)}/>
        <br/>
        <div className="button-container center">
        <input className="button center" type="submit" value="Get intent" />
        </div>
		<div className="outputContainer center" ref={(output) => { this.outputBox = output; }}>
        {this.showOutput()}
		</div>
    </form>
	</div>
	);
  }
  
  showPlaceholder(){
    var text_list = ["Hello","Have a good day","What is this?","How does wit work?","You must do your duty","Maybe there's a better way"];
    return text_list[Math.floor(Math.random() * Math.floor(text_list.length))];
  }	
  
  on(){
	console.log('button clicked');	
	
  }
  

}

export default App;	