import React, { Component, Fragment } from 'react';
import Footer from './container/Footer';
import Navbar from './container/navbar';
import Uploadbox from './components/Uploadbox';
import ImagesGrid from './components/ImagesGrid';
import ImagesViewer from './components/ImagesViewer';


class App extends Component{
  state = {
    imagesData         : "",
    datanumber         : "",
    dataduration       : "",
    counterExecution   : 1
  };

  render(){
    const handleSearchResults = (data, datanumber, dataduration) => {
      this.setState({
        imagesData : data,
        datanumber  : datanumber,
        dataduration  : dataduration,
        counterExecution  : this.state.counterExecution +1
      });
    }
    const {imagesData, datanumber, dataduration, counterExecution} = this.state;

    return(
      <>
        {
          <Fragment>
            <Navbar />
            <Uploadbox sendDataToParent={handleSearchResults} />
            { 
              (counterExecution % 2 == 0) ? 
              ( <ImagesGrid data={imagesData} datanumber={datanumber} dataduration={dataduration} />) : 
              ( imagesData ? handleSearchResults(imagesData, datanumber, dataduration) : "")
            }
            <Footer />
          </Fragment>   
        }
      </>
    )
  }
}

export default App;
