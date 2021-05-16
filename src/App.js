import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import './App.css';
import Clarifai from 'clarifai';

let app = new Clarifai.App({apiKey: 'a4202eb4b5f44c25980b2c73b9d03cda'});

const particalesOptions = { 
      particles: {
       number: {
          value: 30,
          density: {
            enable: true,
            value_area: 800
          }
       }
      }
}



class App extends Component {
  constructor() {
    super(); 
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const box = {
      leftCol : clarifaiFace.left_col * width,
      topRow :  clarifaiFace.top_row * height,
      rightCol : width - (clarifaiFace.right_col * width),
      bottomRow : height - (clarifaiFace.bottom_row * height)
    }
    console.log(clarifaiFace)
    console.log(width, height );
    console.log(box);
    return box
  }

  displayFaceBox = (box) =>{
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({ input : event.target.value});
  }

  onButtonSubmiit = () => {
    this.setState({imageUrl : this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
        .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
        .catch( err => console.log(err));
  }

  render(){
    return (
      <div className="App">
          <Particles className='particles'
          params={particalesOptions} 
          />
        <Navigation/>
        <Logo/>
        <Rank/>
        <ImageLinkForm
          onInputChange={this.onInputChange} 
          onButtonSubmiit={this.onButtonSubmiit}
          />
          <FaceRecognition box= { this.state.box} imageUrl={this.state.imageUrl}/> 
          
      </div>
    );
  }
  
}

export default App;
