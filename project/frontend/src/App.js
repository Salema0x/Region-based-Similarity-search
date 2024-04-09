import React, { Component, Fragment } from 'react';
import Footer from './container/Footer';
import Navbar from './container/navbar';
import Uploadbox from './components/Uploadbox';
import ImagesGrid from './components/ImagesGrid';


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
    const queryParameters = new URLSearchParams(window.location.search)
    const searchImgUrl = queryParameters.get("imgurl");

    return(
      <>
        {
          <Fragment>
            <Navbar />
            <Uploadbox sendDataToParent={handleSearchResults} searchImgUrl={searchImgUrl ? decodeURI(searchImgUrl) : ''}/>
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
