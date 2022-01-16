import React from 'react';
import './App.css';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';


function App() {
  return (
     <div className="App">
         <div className="content">
             <h1>Hello world!</h1>
             <Header/>
             <Footer/>
         </div>
     </div>
  );
}

export default App;
