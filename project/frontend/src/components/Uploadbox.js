import React, {Component, createRef, Fragment} from 'react';
import SelectAndCrop from "./SelectAndCrop";

class Uploadbox extends Component {
    state = {
        croppedImgSrc  : "",
        croppedImgSrc2 : "",
        displayImageUrl: "",
        fileInputImage : "",
        inputUrl       : "",
        isError        : false
    };
    
    form = createRef();

    onSelectImage = event => {
        const file = event.target.files[0];
        if ( ["image/jpeg", "image/jpg", "image/png"].includes(file.type) ) {
            this.setState({
                fileInputImage : URL.createObjectURL(file),
                displayImageUrl: URL.createObjectURL(file),
                isError        : false
            });
        } else {
            this.setState({isError : true});
        }
    };

    removeImg = () => {
        this.form.current.reset();
        this.setState({fileInputImage : ""});
    };

    getCroppedImg = croppedSrc => {
        this.setState({croppedImgSrc : croppedSrc});
    };

    getCroppedImgSecond = croppedSrc => {
        this.setState({croppedImgSrc2 : croppedSrc});
    };

    handleUrlChange = async (event) => {
        const url = event.target.value;
        let file = await fetch(url)
                        .then(r => r.blob())
                        .then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))
        console.log(file);
        if ( ["image/jpeg", "image/jpg", "image/png"].includes(file.type) ) {
            this.setState({
                displayImageUrl: URL.createObjectURL(file),
                inputUrl       : url,
                isError        : false
            });
        } else {
            this.setState({isError : true});
        }
    };

    render() {
        const {displayImageUrl, fileInputImage, inputUrl, isError} = this.state;
        return (
            <div className="container full-display">
                <form ref={this.form}>
                    <section className='section'>
                        <div className="columns">
                            <div className="column">
                                <div className="notification is-link">
                                    <button className="delete"></button>
                                    Please upload your image or enter a URL for it, so I can perform AI-based image similarity analysis.
                                </div>
                                <div className="columns is-mobile"> 
                                    
                                        <div className="column">
                                            <div className="card">
                                                <div className="card-content">
                                                    <div className="file is-boxed">
                                                        <label className="file-label">
                                                            <input className="file-input" type="file" name="resume" accept="image/png, image/jpeg" multiple={false} onChange={this.onSelectImage} />
                                                            <span className="file-cta">
                                                                <span className="file-icon">
                                                                    <i className="fas fa-upload"></i>
                                                                </span>
                                                                <span className="file-label">
                                                                    Choose a file…
                                                                </span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    {isError && (
                                                        <p className="error-message">
                                                            Please load an image type of: (.png, .jpg, .jpeg).
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="card-footer">
                                                    <div className="card-footer-item">
                                                        <div className=" container field">
                                                            <label className="label"> Or enter a URL:</label>
                                                            <div className="control">
                                                                <input className="input" type="text" placeholder="Enter image URL" onChange={this.handleUrlChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="column">
                                            <div className="bd-notification is-info">
                                                {displayImageUrl && (
                                                        <Fragment>
                                                            <button
                                                                className="btn btn-danger remove-image"
                                                                onClick={this.removeImg}
                                                            >
                                                                Remove image
                                                            </button>
                                                            <SelectAndCrop
                                                                getCroppedImg={this.getCroppedImg}
                                                                image={displayImageUrl}
                                                            />
                                                            <div className="button is-success">
                                                                <a rel="noopener noreferrer">Search similar images</a>
                                                            </div>
                                                        </Fragment>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    
                                </div>   
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        );
    }
}

export default Uploadbox;