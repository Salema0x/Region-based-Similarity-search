import React, {PureComponent} from 'react';


// crop image component
class CropImageSearch extends PureComponent {
    state = {
        radioValue: 'searchArea'
    }

    imageObject = new Image();

    componentDidMount() {
        const {imageSrc}     = this.props;
        this.imageObject.src = imageSrc;
        this.imageObject.setAttribute("crossOrigin", "anonymous");
    }

    getImagePortion = (imgObject, newWidth, newHeight, startX, startY) => {
        // setIsCropped => a method to set a flag whether image is cropped or not
        const {setIsCropped, getCroppedImg} = this.props,
              cropCanvas                                                = document.createElement("canvas"),
              cropCanvasContext                                         = cropCanvas.getContext("2d"),
              originalImage                                             = document.createElement('canvas'),
              originalImageContext                                      = originalImage.getContext('2d'),
              imageWidth                                                = imgObject.width,
              imageHeight                                               = imgObject.height,
              scaleH                                                    = 1, // Set horizontal scale to -1 if flip horizontal
              scaleV                                                    = 1, // Set verical scale to -1 if flip vertical
              posX                                                      = 0, // Set x position to -100% if flip horizontal
              posY                                                      = 0; // Set y position to -100% if flip vertical (imageHeight * -1)
        let scale                                                       = 1;
        cropCanvas.width                                                = newWidth;
        cropCanvas.height                                               = newHeight;

        if (imageWidth > document.documentElement.offsetWidth) {
            scale = imageWidth / document.documentElement.offsetWidth;
        }

        // canvas of original image
        originalImage.width  = imageWidth;
        originalImage.height = imageHeight;
        originalImageContext.drawImage(imgObject, 0, 0);

        originalImageContext.save(); // Save the current state
        originalImageContext.scale(scaleH, scaleV); // Set scale to flip the image
        originalImageContext.drawImage(imgObject, posX, posY, imageWidth, imageHeight); // draw the image
        originalImageContext.restore(); // Restore the last saved state

        cropCanvasContext.drawImage(
            originalImage,
            startX * scale,
            startY * scale,
            newWidth * scale,
            newHeight * scale,
            0,
            0,
            newWidth,
            newHeight
        );
        const croppedSrc = cropCanvas.toDataURL();

        setIsCropped(true);
        getCroppedImg(croppedSrc);
    };

    handleRadioChange = (e) => {
        this.setState({
          radioValue: e.target.value
        });
    };

    executeApp = (e) => {
        e.preventDefault();
        const {width, height, x, y} = this.props;
        switch (this.state.radioValue){
            case 'searchArea':
                //box prompt
                break;
            case 'searchAll':
                //image query
                break;
            default:
                this.getImagePortion(this.imageObject, width, height, x, y);
        }
    };

    render() {
        const {width, height, x, y} = this.props;
        const { radioValue } = this.state;
        return (
            <><div className='form-group'>
                <div className='radio'>
                    <label>
                        <input type='radio' value='searchArea' checked={radioValue === 'searchArea'} onChange={this.handleRadioChange} />
                        Search for similar images for the selected area
                    </label>
                </div><br/>
                <div className='radio'>
                    <label>
                        <input type='radio' value='searchAll' checked={radioValue === 'searchAll'} onChange={this.handleRadioChange} />
                        Search for similar images for the entire image
                    </label>
                </div><br/>
                <div className='radio'>
                    <label>
                        <input type='radio' value='justCrop' checked={radioValue === 'justCrop'} onChange={this.handleRadioChange} />
                        Just crop
                    </label>
                </div><br/>
            </div>
            <div className="crop-image-component-wrapper">
                <button className="button is-success" onClick={this.executeApp}>
                    run
                </button>
            </div></>
        );
    }
}

export default CropImageSearch;