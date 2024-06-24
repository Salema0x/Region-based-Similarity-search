import React, {PureComponent} from 'react';
import ImagesGrid from "./ImagesGrid";

// crop image component
class CropImageSearch extends PureComponent {
    state = {
        radioValue      : 'searchArea',
        numberResults   :  100,
        resultData      : {}
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

    numberResultsChange = e => {
        const enteredNumberResult = e.target.value;
        this.setState({
            numberResults: enteredNumberResult < 1 ? 1 : enteredNumberResult
        });
    }

    handleRadioChange = (e) => {
        this.setState({
          radioValue: e.target.value
        });
    };

    executeApp = async (e) => {
        e.preventDefault();
        
        this.props.setLoaderImages(true);

        const {imageSrc, width, height, x, y} = this.props;
        const { numberResults } = this.state;

        let pulledData = [];

        let file = await fetch(imageSrc)
                        .then(r => r.blob())
                        .then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))

        const formData = new FormData();
        formData.append("image", file);
        formData.append("maxResults", numberResults);

        switch (this.state.radioValue){
            //box prompt: query data from server
            case 'searchArea':
                formData.append("left", x | 0);
                formData.append("top", y | 0);
                formData.append("right", (x + width) | 0);
                formData.append("bottom", (y  + height) | 0);
                try{
                    const result = await fetch(window.location.origin + window.location.pathname +'api/searchbox/',{
                        method: 'POST',
                        body: formData
                    });
                    pulledData = await result.json();
                } catch (error) {
                    console.error(error);
                }
                break;

            //image query: query data from server
            case 'searchAll':
                try{
                    const result = await fetch(window.location.origin + window.location.pathname + 'api/search/',{
                        method: 'POST',
                        body: formData
                    });
                    pulledData = await result.json();
                } catch (error) {
                    console.error(error);
                }
                break;

            //just crop the image
            default:
                this.getImagePortion(this.imageObject, width, height, x, y);
                this.props.setLoaderImages(false);
        }

        //dummy data for an overview of structure of the result
        //max score is 256, so goal of progressbar in imagesViewer is 256
        const dummyData = {
            "duration": 0.2977478504180908,
            "images": [
                {
                    "imageid": "3hyfHJABRSWQLZJ7jlw8",
                    "id": 0,
                    "score": 184,
                    "imagepath": "https://c1.staticflickr.com/3/2852/11906222413_2e20cac437_b.jpg",
                    "thumbpath": "https://c1.staticflickr.com/3/2852/11906222413_2e20cac437_b.jpg",
                    "imageinfo": {
                        "license": "https://creativecommons.org/licenses/by/2.0/",
                        "authorprofileurl": "https://www.flickr.com/people/ssoosay/",
                        "author": "Surian Soosay",
                        "title": "Laser Biopsy"
                    }
                },
                {
                    "imageid": "ATOjHJABRSWQLZJ771_C",
                    "id": 1,
                    "score": 178,
                    "imagepath": "https://farm7.staticflickr.com/3909/14389208149_2333f3b5b5_b.jpg",
                    "thumbpath": "https://farm7.staticflickr.com/3909/14389208149_2333f3b5b5_b.jpg",
                    "imageinfo": {
                        "license": "https://creativecommons.org/licenses/by/2.0/",
                        "authorprofileurl": "https://www.flickr.com/people/ssoosay/",
                        "author": "Surian Soosay",
                        "title": "Snake Populations Decline / Boa Constricted"
                    }
                }
            ],
            "thumbs_url": "",
            "images_url": ""
        }
        console.log(pulledData);
        this.props.sendDataToParent(pulledData.images, pulledData.images.length, pulledData.duration);
    };

    render() {
        const {width, height, x, y} = this.props;
        const { radioValue, numberResults, resultData} = this.state;
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
                <center>
                { (radioValue !== 'justCrop') ? 
                    (<table>
                        <tbody>
                            <tr>
                                <td> Number of results </td>
                                <td rowSpan="2">
                                    <button className="button is-success" onClick={this.executeApp}> run </button>
                                </td>
                            </tr>
                            <tr>
                                <td> <input type="number" value={numberResults} placeholder="Enter the number of results" onChange={this.numberResultsChange} /> </td>
                            </tr>
                        </tbody>
                    </table>
                    ) : (
                        <button className="button is-success" onClick={this.executeApp}> run </button>
                    )
                }
                </center>
            </div>
            </>
        );
    }
}

export default CropImageSearch;