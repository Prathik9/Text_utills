import React, { useState } from "react";

export default function TextForm(props) {


  const handleUpClick = () => {
    setText(text.toUpperCase());
    props.showAlert("Converted to Uppercase!","success");
  };
  const handleLoClick = () => {
    setText(text.toLowerCase());
    props.showAlert("Converted to Lowercase!","success");
  };
  const handleClearClick = () => {
    setText("");
    props.showAlert("Text cleared!","success");
  };

  const handleOnChange = (event) => {
    setText(event.target.value);
  };

  const handleExtraSpaces = (event) => {
    let newText = text.split(/[ ]+/);
    setText(newText.join(" "));
  props.showAlert("Extra spaces removed!","success");
  };


  const handleCopy=()=>{
    console.log("i am a copy")
    let text=document.getElementById("mybox");
    text.select();
    // text.setselectionRange(0,9999);
    navigator.clipboard.writeText(text.value);
    props.showAlert("Copied to clipboard!","success");
  }
  

  const [text, setText] = useState("");

  return (
    <>
      <div className="container" style={{color: props.mode==='dark'?'white':'black'}}>  
        <h1>{props.heading} </h1>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={text}
            onChange={handleOnChange}
            id="mybox"
            rows="8"
            style={{backgroundColor: props.mode==='dark'?'grey':'white', color: props.mode==='dark'?'white':'black'}}
          ></textarea>
        </div>
        <button className="btn btn-primary mx-2" onClick={handleUpClick}>
          Convert to upper-case
        </button>
        <button className="btn btn-primary mx-2" onClick={handleLoClick}>
          Convert to lower-case
        </button>
        <button className="btn btn-primary mx-2" onClick={handleClearClick}>
          Cleat text
        </button>
        <button className="btn btn-primary mx-2" onClick={handleCopy}>
          Copy text
        </button>
        <button className="btn btn-primary mx-2" onClick={handleExtraSpaces}>
          Remove extra spaces
        </button>
      </div>
      <div className="container my-3" style={{color: props.mode==='dark'?'white':'black'}}>
        <h2>Your text summary</h2>
        <p>{text.split(" ").length} words, {text.length} characters</p>
        <p>{0.008*text.split(" ").length} Minutes read</p>
        <h2>Preview </h2>
        <p>{text.length>0?text:"Enter Something to preview here"}</p>
      </div>
    </>
  );
}



