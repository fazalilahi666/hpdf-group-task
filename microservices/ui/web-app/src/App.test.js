import React, { Component } from 'react';
import './App.css';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const style = {
  height: 60,
  width: '100%',
  fontSize: 40,
  color: 'navajowhite',
  paddingTop: 10,
  paddingBottom:10,
  fontFamily: "monospace",
  textAlign: 'center',
  display: 'inline-block',
  backgroundColor: '#8B0000',
};

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      text : 'fdajk ljdal',
      intent : 'None',
	  intentResponse : ''
    }
  }
  handleTextChange(e){
    console.log(e.target.value);
	this.setState({
	  text:e.target.value,
    })
  }
 
  create(e){
	  alert('create function called');
	  var frag = document.createDocumentFragment(),
	  temp = document.createElement(e);
	  temp.innerHTML = this.state.intent;
	  while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
	  return frag;
  }
  
  status(response) 
  {
	alert ('status function called');
	if (response.status >= 200 && response.status < 300) 
	{
		return Promise.resolve(response)
	} 
	else 
	{
		return Promise.reject(new Error(response.statusText))
	}
  } 
  
  changeOutput(e){
    e.preventDefault();
    alert('Function called');
	alert(this.state.text);
	fetch('https://api.abash76.hasura-app.io/get-news', 
	{
      method: 'POST',
	  mode: 'no-cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
		
      },
      body: JSON.stringify({
		getNews: this.state.text
	  }),
    })
    .then(this.status.bind(this))
	.then((response) => response.json())
	.then(response => {
        this.setState({
          intentResponse: JSON.stringify(response),
          intent: response.data.intent[0].value
        })
	})
	.catch(error => console.log(error));
	alert(this.state.intent);
  }
  
  render() {
    return (
    	<MuiThemeProvider>
		<div>
    		<Paper style={style} zDepth={5}>Team19_POA</Paper>
    	<form className="WitForm" onSubmit={this.changeOutput.bind(this)}>
            <input align="middle" className="a" placeholder={this.showPlaceholder()} type="text" value={this.state.text} onChange={this.handleTextChange.bind(this)}/>
            <input className="button center" type="submit" value="Get intent"/>
    		     <div id="demo" className="outputContainer center" ref={(output) => { this.outputBox = output; }}>
            {this.state.intent}
    		    </div>
        </form>
    	</div>
		</MuiThemeProvider>
	);
  }

  on ()
  {
	document.display(document.getElementsByClassName("da"));
	alert('on function');
  }
  showPlaceholder(){
    var text_list = [
      "Hello",
      "What's up in Mumbai at 4pm today?",
      "Tell me about Tesla",
      "How is the weather today?",
      "Tell me about the next IPL match",
      "What's trending?",
      "Bye!"];
    return text_list[Math.floor(Math.random() * Math.floor(text_list.length))];
  }
}

export default App;
