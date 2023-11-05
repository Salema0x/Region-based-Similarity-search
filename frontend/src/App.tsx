import React from "react";

const Example = (props: {title : string, number: number}) => {
    return <div>{props.title} {props.number}</div>
}

const App = () => {
  return <Example title="Welcome to Fobra" number={2023}/>
};

export default App;
