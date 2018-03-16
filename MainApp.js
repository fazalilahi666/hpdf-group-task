import React from 'react';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './Style.css';
import Img from './download (1).png';
//import Tags from 'react-material-tags';

const Paper_Style = {
    width: 300,
    height  : 550,
    marginTop: 50,
    marginLeft: 550,
    paddingRight: 45,
    overflowX: 'hidden',
    overflowY: 'auto'
}

const gen_style={
    textAlign: 'left'
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.changeOutput = this.changeOutput.bind(this);
        this.onaf = this.onaf.bind(this);
        this.state = {
            text : 'fdajk ljdal',
            intent : '',
            intentResponse : '',
            arr: []
        }
    }
    
    status(response) 
    {
	   //alert ('status function called');
	   if (response.status >= 200 && response.status < 300) 
		  return Promise.resolve(response)
	   else 
		  return Promise.reject(new Error(response.statusText))
    }
    
    changeOutput(){
        let c=document.getElementById('searched').value;
        //alert('Function called');
        //alert(c);
        fetch('https://api.abash76.hasura-app.io/get-news', {
            method: 'POST',
            //mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchQuery : c
	       }),
        }).then((response) => response.json())
            .then(responseJson => {
                alert(JSON.stringify(responseJson));
                this.setState({
                    intentResponse: JSON.stringify(responseJson),
                    intent:  responseJson.data,
                    arr: responseJson.data.items,
                });
                let a=document.createElement('p');
                let Pap=document.createElement('Paper');
                let ta=document.createTextNode(this.state.intent);
                //alert(document.getElementById('searched').value)
                Pap.className='Pap-Server';
                a.appendChild(ta);
                a.className='Server';
                Pap.appendChild(a);
                document.getElementById('Paper').appendChild(Pap);
                alert(responseJson.data);
            })
            .catch(error => console.log(error));
        /*if(this.state.intent.isArray)
            this.state.intent='is an array';
        else
        {/*this.state.intent='is not an array';*///}
        //alert(this.state.intent);
        //console.log(this.state.intent);
    }
    
    
    onaf(){
        //alert('Function called');
        let a=document.createElement('p');
        let Pap=document.createElement('Paper');
        //alert(a);
        let ta=document.createTextNode(document.getElementById('searched').value);
        //alert(document.getElementById('searched').value)
        Pap.className='Pap-User';
        a.appendChild(ta);
        a.className='User';
        Pap.appendChild(a);
        document.getElementById('Paper').appendChild(Pap);
        this.changeOutput();
        //alert('Function body ended');
        //document.getElementById('last').focus();
    }
    
    
    
    abc = (e) => {
        //alert('Hi there');
        //let input = document.getElementById("searched");
        //input.addEventListener("keyup", function(event) {
            //event.preventDefault();
            console.log(e.keyCode)
            if (e.keyCode === 13) {
                console.log('hi there'+e.keyCode);
                document.getElementById("enter").click();
                document.getElementById("Paper").focus();
            }
            //else
              //alert(e.keyCode);
    }
    
    render() {
        return (
            <MuiThemeProvider>
                <Paper id='Paper' style={Paper_Style} zDepth={5}><br/>
                    <p className='last' style={gen_style}>Hi you can request for the news, through the message</p>
                </Paper>
                <input id='searched' type='text' onKeyUp={this.abc} placeholder='Send a message'></input>
                <input id='enter' type='image' value='submit' src={Img} alt='0fklalsdkfa' onClick={()=>{this.onaf()}}/>
            </MuiThemeProvider>
        )
    }
}

//function onaf(){
//    alert('Function called');
//    let a=document.createElement('p');
//    let ta=document.createTextNode(document.getElementById('enter').innerHTML);
//    a.appendChild(ta);
//    document.getElementById('Paper').appendChild(a);
//}

export default App;