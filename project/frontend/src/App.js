import React, { Component, Fragment } from 'react';
import Footer from './container/Footer';
import Navbar from './container/navbar';
import Uploadbox from './components/Uploadbox';
import ImagesGrid from './components/ImagesGrid';
import { LoarderPoint } from './components//LoadingAnimation';


class App extends Component{
  state = {
    imagesData         : "",
    datanumber         : "",
    dataduration       : "",
    isLoadingImages    : false,
    counterExecution   : 1
  };

  render(){
    const setLoaderImages = (isLoading) => {
      this.setState({
        isLoadingImages : isLoading
      });
    }
    const handleSearchResults = (data, datanumber, dataduration) => {
      this.setState({
        imagesData : data,
        datanumber  : datanumber,
        dataduration  : dataduration,
        counterExecution  : this.state.counterExecution +1,
        isLoadingImages : false
      });
    }
    const {imagesData, datanumber, dataduration, isLoadingImages, counterExecution} = this.state;
    const queryParameters = new URLSearchParams(window.location.search)
    const searchImgUrl = queryParameters.get("imgurl");

    return(
      <>
        {
          <Fragment>
            <Navbar />
            <Uploadbox sendDataToParent={handleSearchResults} setLoaderImages={setLoaderImages} searchImgUrl={searchImgUrl ? decodeURI(searchImgUrl) : ''}/>
              { isLoadingImages ?
                (<LoarderPoint />) :
                (
                  (counterExecution % 2 == 0) ? 
                  ( <ImagesGrid data={imagesData} datanumber={datanumber} dataduration={dataduration} />) : 
                  ( imagesData ? handleSearchResults(imagesData, datanumber, dataduration) : "")
                )
            }
            <Footer />
          </Fragment>   
        }
      </>
    )
  }
}

export default App;
