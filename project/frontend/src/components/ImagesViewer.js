import React, { Component, Fragment } from 'react';
import Utils from './Utils';

class ImagesViewer extends Component{
  state = {
    imagesData         : {},
    currentImageData   : {}
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

  render(){
    const similaritypercent = ( parseFloat(this.props.datachosen.similarity)*100 ) + " %";
    return(
      <>
        <div className='bgImgViewer'>
            <div className='topBarImgViewer'>
                <span className='ctnLeft'>6/7</span>
                <span className='ctnRight' id='closeImgViewer' onClick={this.props.closeViewer}>🞩</span>
                <span className='ctnRight' id='openFullScreen' onClick={this.openFullscreen}>⛶</span>
                <span className='ctnRight' id='closeFullScreen' onClick={this.closeFullscreen}> <sup>⌟</sup><sub>⌜</sub> </span>
            </div>
            <button className='btnSlideLeftImg' title='Previous'></button>
            <div className='ctnImgViewer'>
                <img src={this.props.datachosen.enlargedSrc}></img>
            </div>
            <button className='btnSlideRightImg' title='Next'></button>
            <div className='captionImgViewer'>
                <div className="captionImgInfos">Title: <b>{this.props.datachosen.title}</b> <br/> 
                    Author: <span dangerouslySetInnerHTML={{__html: this.props.datachosen.author}} ></span>
                    <p dangerouslySetInnerHTML={{__html: this.props.datachosen.license}}></p>
                </div>
                <table className="progress-infos">
                    <tbody>
                        <tr>
                            <td> <span className='progress-label'>Similarity</span></td>
                            <td> 
                                <span className="progress-container" title={similaritypercent}>
                                    <ProgressBar 
                                        progress={this.props.datachosen.similarity}
                                        goal='1'
                                    />
                                </span>
                            </td>
                            <td> <a className="searchbutton" href="">Search</a> </td>
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
