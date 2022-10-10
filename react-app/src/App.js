import './App.css';
import Home from './Home.js' ;
import CreateRoom from './CreateRoom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';

function App() {
  return (
    
    <div className="App">
      <header className="App-header">
        <Router>
          <Routes>
            <Route path='' element={<Home />}/>
            <Route path='/CreateRoom' element={<CreateRoom />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;
