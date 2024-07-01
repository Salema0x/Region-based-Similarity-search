import React, { useState } from 'react';
import Icon from '../assets/icon.png'

const Upload = () => {
    const [fileUrl, setFileUrl] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [displayImageUrl, setDisplayImageUrl] = useState(''); // state to hold the image URL or the uploaded file URL

    const handleFileChange = (event) => {
        console.log('no changes applies ');
        const file = event.target.files[0];
        if (file) {
            console.log('sw');
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            setDisplayImageUrl(url); // update the displayed image
        }
    };

    const handleUrlChange = (event) => {
        console.log('boi');
        const url = event.target.value;
        setInputUrl(url);
        setDisplayImageUrl(url); // update the displayed image
    };

    return (
        
        <section className='section'>
            <div className="columns is-justify-content-center">
                <div className="column">
                    <div className="columns">
                        <div className="column">
                            <div className="notification">
                                Please upload your image or enter a URL for it, so I can perform AI-based image similarity analysis.
                            </div>
                            <div className="card">
                                <div className="card-content">
                                    <div className="file is-boxed">
                                        <label className="file-label">
                                            <input className="file-input" type="file" name="resume" onChange={handleFileChange} />
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
                                    {fileUrl && 
                                        <div className="button is-success">
                                            <a className='is-white' href={fileUrl} target="_blank" rel="noopener noreferrer">View Uploaded File</a>
                                        </div>
                                    }
                                </div>

                                <div className="card-footer">
                                    <div className="card-footer-item">
                                        <div className=" container field">
                                            <label className="label"> Or enter a URL:</label>
                                            <div className="control">
                                                <input className="input" type="text" placeholder="Enter image URL" value={inputUrl} onChange={handleUrlChange} />
                                            </div>
                                            {inputUrl && 
                                                <div className="button is-success">
                                                    <a href={inputUrl} target="_blank" rel="noopener noreferrer">View Image from URL</a>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <p className="bd-notification is-info"> {displayImageUrl ? (
                            <img src={displayImageUrl} alt="Uploaded or Selected" />
                        ) : (
                            // Your SVG placeholder goes here
                            // If the SVG is an external file:
                            <img src={Icon} alt="Placeholder" />
                            // If you want to embed the SVG directly, put the SVG code here
                        )}</p>
                           
                        </div>
               </div>   
             </div>
            </div>
          </section>
    )
}

export default Upload;
