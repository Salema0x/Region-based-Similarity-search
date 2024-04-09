import React, { Component } from 'react';
import Utils from './Utils';

class ImagesViewer extends Component{

  state = {
          imagesData       : this.props.data,
          currentImageData : this.props.datachosen,
          currentIndexData : this.getDataIndex(this.props.data, this.props.datachosen)
  };

  openFullscreen(){
    document.getElementById('closeFullScreen').style.display = 'inline-block';
    document.getElementById('openFullScreen').style.display = 'none';
    Utils.openFullscreen();
  }

  closeFullscreen(){
    document.getElementById('closeFullScreen').style.display = 'none';
    document.getElementById('openFullScreen').style.display = 'inline-block';
    Utils.closeFullscreen();
  }

  getDataIndex(data, chosenData){
      for(let i=0; i<data.length; i++){
        if(data[i] == chosenData){
          return i+1;
        }
      }
      return 0;
  }

  loadDataByIndex = (data, index) => {
    if(index>0 && index<=data.length){
      this.setState({
        currentImageData: data[index-1],
        currentIndexData: index
      });
    }
  }
  
  render(){
    const {imagesData, currentImageData, currentIndexData} = this.state;
    const similaritypercent = ( parseFloat(currentImageData.similarity)*100 ) + " %";

    return(
      <>
        <div className='bgImgViewer'>
            <div className='topBarImgViewer'>
                <span className='ctnLeft'> {currentIndexData} / {imagesData.length} </span>
                <span className='ctnRight' id='closeImgViewer' onClick={this.props.closeViewer}>🞩</span>
                <span className='ctnRight' id='openFullScreen' onClick={this.openFullscreen}>⛶</span>
                <span className='ctnRight' id='closeFullScreen' onClick={this.closeFullscreen}> <sup>⌟</sup><sub>⌜</sub> </span>
            </div>
            <button className='btnSlideLeftImg' title='Previous' onClick={() => this.loadDataByIndex(imagesData, (currentIndexData-1))}></button>
            <div className='ctnImgViewer'>
                <img src={currentImageData.enlargedSrc}></img>
            </div>
            <button className='btnSlideRightImg' title='Next' onClick={() => this.loadDataByIndex(imagesData, (currentIndexData+1))} ></button>
            <div className='captionImgViewer'>
                <div className="captionImgInfos">Title: <b>{currentImageData.title}</b> <br/> 
                    Author: <span dangerouslySetInnerHTML={{__html: currentImageData.author}} ></span>
                    <p dangerouslySetInnerHTML={{__html: currentImageData.license}}></p>
                </div>
                <table className="progress-infos">
                    <tbody>
                        <tr>
                            <td> <span className='progress-label'>Similarity</span></td>
                            <td> 
                                <span className="progress-container" title={similaritypercent}>
                                    <ProgressBar 
                                        progress={currentImageData.similarity}
                                        goal='1'
                                    />
                                </span>
                            </td>
                            <td> <a className="searchbutton" href={encodeURI(window.location.origin + window.location.pathname +'?imgurl='+currentImageData.thumbnailSrc)}>Search</a> </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </>
    )
  }
}

class ProgressBar extends Component {
    calculateProgress(progress, goal) {
      if (Number(progress) === 0) {
        return 0.75 + "%"
      }
      if (Number(goal) >= Number(progress)) {
        return (progress/goal) * 100 + "%"
      } else {
        return 100 + "%"
      }
    }
    
    render() {
      const { progress, goal } = this.props
      return (
        <div 
          className="progress-bar"
          style={{width: this.calculateProgress(progress, goal) }}
         ></div>
      )
    }
  }
  

export default ImagesViewer;
