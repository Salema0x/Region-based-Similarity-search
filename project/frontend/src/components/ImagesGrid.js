import React, {Component} from 'react';
import ImagesViewer from './ImagesViewer';


class ImagesGrid extends Component {
    constructor() {
        super();
        this.state = {
            imagesObjs      : {},
            imageDataChosen     : {},
            numberResults   : "0",
            durationResults : "0.0",
            isViewingImage  : false
        }
    }

    UNSAFE_componentWillMount()  {
        this.setState({
            imagesObjs: this.props.data,
            numberResults: this.props.datanumber,
            durationResults: this.props.dataduration,
        });
    }


    render()  {
        const openImageViewer = (chosenData)=>{
            this.setState({
                imageDataChosen: chosenData,
                isViewingImage  : true
            });
        }
        const closeImageViewer = ()=>{
            this.setState({
                imageDataChosen: {},
            isViewingImage  : false
            });
        }
        const {imagesObjs, imageDataChosen, numberResults, durationResults, isViewingImage} = this.state;
        return (
            <>
          <div className="imagesgrid">
            <TitleGrid datanumber={ numberResults } dataduration={ durationResults } />
            {   parseInt(numberResults) > 0 && 
                <Deck data={ imagesObjs } openImageViewer={openImageViewer}/>
            }
            {   
                isViewingImage && 
                <ImagesViewer data={ imagesObjs } datachosen={ imageDataChosen } viewImage={openImageViewer} closeViewer={closeImageViewer}/>
            }
          </div>
          </>
        )
    }
}
  

class TitleGrid extends Component {
    constructor(props)  {
        super(props);
    }
    render() {
      return (
        <div className='titlegrid'>
            {
            parseInt(this.props.datanumber) > 0 ?
            (<h3>{this.props.datanumber} images found, took { parseFloat(this.props.dataduration).toFixed(2) } seconds</h3>) : 
            (<h3> No similar image found</h3>)
            }
        </div>
      )
    }
}
  

class Deck extends Component  {
    constructor(props)  {
      super(props);
    }
    render()  {
        return (
        <div className='deck'>
            { this.props.data.map((imgObj, index) => ( <ImagesCard owndata={imgObj}  viewImage={this.props.openImageViewer}/> )) }
        </div>
        );
    }
}
  

class ImagesCard extends Component  {
    constructor(props)  {
        super(props);
    }
    render()  {
        return (
            <div className='itemImagesCard'>
                <img className='imagesCard' src={this.props.owndata.thumbpath} onClick={()=>this.props.viewImage(this.props.owndata)} />
                <span className='caption'> <a className='searchbutton' href={encodeURI(window.location.origin + window.location.pathname +'?imgurl='+this.props.owndata.imagepath)}>Search</a> </span>
            </div>
        )
    }
}
  
export default ImagesGrid;