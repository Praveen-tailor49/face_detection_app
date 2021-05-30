import React, {
  Component
} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import './App.css';
import Clarifai from 'clarifai';

let app = new Clarifai.App({
  apiKey: 'a4202eb4b5f44c25980b2c73b9d03cda'
});


const particalesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}


const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: ' ',
    name: ' ',
    email: ' ',
    entries: 0,
    joined: ''
  }
}



class App extends Component {
  constructor() {
    super();
    this.state = initialState

  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const box = {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    console.log(clarifaiFace)
    console.log(width, height);
    console.log(box);
    return box
  }

  displayFaceBox = (box) => {
    this.setState({
      box: box
    });
  }

  onInputChange = (event) => {
    this.setState({
      input: event.target.value
    });
  }

  onButtonSubmiit = () => {
    this.setState({
      imageUrl: this.state.input
    });
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        if (response) {
          fetch('https://murmuring-depths-17161.herokuapp.com/image', {
              method: 'put',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {
                entries: count
              }))
            })
            .catch(err => console.log('error'))
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signin') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({
        isSignedIn: true
      })
    }
    this.setState({
      route: route
    })
  }

  render() {
    return ( <
        div className = "App" >
        <
        Particles className = 'particles'
        params = {
          particalesOptions
        }
        /> <
        Navigation isSignedIn = {
          this.state.isSignedIn
        }
        onRouteChange = {
          this.onRouteChange
        }
        / > {
        this.state.route === 'home' ?
        <
        div >
        <
        Logo / >
        <
        Rank name = {
          this.state.user.name
        }
        entries = {
          this.state.user.entries
        }
        / > <
        ImageLinkForm onInputChange = {
          this.onInputChange
        }
        onButtonSubmiit = {
          this.onButtonSubmiit
        }
        /> <
        FaceRecognition box = {
          this.state.box
        }
        imageUrl = {
          this.state.imageUrl
        }
        /> < /
        div > : (
          this.state.route === 'signin' ?
          <
          Signin loadUser = {
            this.loadUser
          }
          onRouteChange = {
            this.onRouteChange
          }
          / > : <
          Register loadUser = {
            this.loadUser
          }
          onRouteChange = {
            this.onRouteChange
          }
          / >
        )
      } <
      /div>
  );
}
}

export default App;
