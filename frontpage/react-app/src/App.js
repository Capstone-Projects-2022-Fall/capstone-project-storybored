import './App.css';
import Home from './components/Home.js' ;
import CreateRoom from './components/CreateRoom.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

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
